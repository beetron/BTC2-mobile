import { useState } from "react";
import axiosClient from "../utils/axiosClient";
import conversationStore, { Message } from "../zustand/conversationStore";
import { useAuth } from "../context/AuthContext";
import { Alert } from "react-native";
import { useNetwork } from "@/src/context/NetworkContext";
import { useTranslation } from "./useTranslation";
import { saveCurrentMessagesToCache } from "../utils/messageCache";

// The API answers 400 "Cannot reply to a deleted message" / "Cannot reply
// to that message" when the quoted message is gone. Shared with photo
// uploads (useSendImages).
export const isReplyTargetGone = (e: any) =>
  e?.response?.status === 400 &&
  /cannot reply to/i.test(String(e?.response?.data?.error ?? ""));

const useSendMessage = () => {
  const { authState } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { selectedConversation, upsertMessages, clearComposer } =
    conversationStore();
  const { isConnected } = useNetwork();
  const { t } = useTranslation();

  // Resolves true only when the message was accepted by the server, so the
  // caller can restore the input text on any failure path. replyToId makes
  // it a quote reply.
  const sendMessage = async (
    message: string,
    replyToId?: string
  ): Promise<boolean> => {
    try {
      setIsLoading(true);

      if (!isConnected) {
        Alert.alert(t("errors.noInternetTitle"), t("errors.noInternetSendMessages"));
        setIsLoading(false);
        return false;
      }

      if (authState?.authenticated && selectedConversation && message) {
        const conversationId = selectedConversation.conversationId;
        const res = await axiosClient.post(
          `/conversations/${conversationId}/messages`,
          replyToId ? { message, replyToId } : { message }
        );
        if (res.status === 200 && authState.user) {
          // The response carries the stored message (server _id, createdAt
          // and, for a reply, the replyTo preview). Upserting by _id means a
          // change sync that races this response can't add a second copy.
          const stored: Message = res.data.message ?? {
            _id: res.data.messageId,
            senderId: authState.user._id,
            message,
            createdAt: new Date().toISOString(),
            conversationId,
          };
          upsertMessages([stored]);
          saveCurrentMessagesToCache(authState.user._id);
          return true;
        }
        Alert.alert(t("common.error"), t("conversation.sendMessageFailed"));
      }
      return false;
    } catch (e: any) {
      if (e.networkError === "TIMEOUT") {
        Alert.alert(
          t("errors.connectionTimeoutTitle"),
          t("errors.connectionTimeoutMessage")
        );
      } else if (e.networkError === "NO_INTERNET") {
        // Already alerted in pre-flight check
      } else if (replyToId && isReplyTargetGone(e)) {
        // The quoted message was deleted for everyone (or removed)
        // meanwhile. Drop the reply; the caller restores the text so it can
        // be sent as a plain message.
        console.log("Reply rejected: ", e.response?.data?.error);
        clearComposer();
        Alert.alert(t("common.error"), t("conversation.composer.replyTargetGone"));
      } else {
        console.log("Error: ", e.response?.data?.error || e.message);
        Alert.alert(t("common.error"), t("conversation.sendMessageFailed"));
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  return { sendMessage, isLoading };
};

export default useSendMessage;
