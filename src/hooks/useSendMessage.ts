import { useState } from "react";
import axiosClient from "../utils/axiosClient";
import conversationStore from "../zustand/conversationStore";
import { useAuth } from "../context/AuthContext";
import { Alert } from "react-native";
import { useNetwork } from "@/src/context/NetworkContext";
import { useTranslation } from "./useTranslation";

const useSendMessage = () => {
  const { authState } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { selectedConversation, prependMessage, setLatestMessageId } =
    conversationStore();
  const { isConnected } = useNetwork();
  const { t } = useTranslation();

  const sendMessage = async (message: string) => {
    try {
      setIsLoading(true);

      if (!isConnected) {
        Alert.alert(t("errors.noInternetTitle"), t("errors.noInternetSendMessages"));
        setIsLoading(false);
        return;
      }

      if (authState?.authenticated && selectedConversation && message) {
        const conversationId = selectedConversation.conversationId;
        const res = await axiosClient.post(
          `/conversations/${conversationId}/messages`,
          { message }
        );
        if (res.status === 200 && authState.user) {
          const { messageId } = res.data;
          // Optimistically add locally -- the response only echoes back the
          // new messageId, not the full message. The socket event drives
          // the other party's refetch; we already have our own copy here.
          prependMessage({
            _id: messageId,
            senderId: authState.user._id,
            message,
            createdAt: new Date().toISOString(),
            conversationId,
          });
          setLatestMessageId(messageId);
        } else {
          Alert.alert(t("common.error"), t("conversation.sendMessageFailed"));
        }
        setIsLoading(false);
      }
    } catch (e: any) {
      if (e.networkError === "TIMEOUT") {
        Alert.alert(
          t("errors.connectionTimeoutTitle"),
          t("errors.connectionTimeoutMessage")
        );
      } else if (e.networkError === "NO_INTERNET") {
        // Already alerted in pre-flight check
      } else {
        console.log("Error: ", e.response?.data?.error || e.message);
      }
    } finally {
      setIsLoading(false);
    }
  };
  return { sendMessage, isLoading };
};

export default useSendMessage;
