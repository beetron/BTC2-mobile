import { useState } from "react";
import { Alert } from "react-native";
import axiosClient from "../utils/axiosClient";
import conversationStore, { isConversationOpen } from "../zustand/conversationStore";
import { useAuth } from "../context/AuthContext";
import { useNetwork } from "@/src/context/NetworkContext";
import { useTranslation } from "./useTranslation";
import { saveCurrentMessagesToCache } from "../utils/messageCache";

// Edit and delete-for-everyone on one of your own messages (API 2.0).
// Not to be confused with useDeleteMessages, which clears history from
// your own view only (/messages/delete/:id).
const useMessageActions = () => {
  const { authState } = useAuth();
  const { isConnected } = useNetwork();
  const { t } = useTranslation();
  const { selectedConversation, upsertMessages } = conversationStore();
  const [isLoading, setIsLoading] = useState(false);

  const run = async (
    request: (conversationId: string) => Promise<any>,
    failedKey: string
  ): Promise<boolean> => {
    if (!selectedConversation) return false;
    if (!isConnected) {
      Alert.alert(t("errors.noInternetTitle"), t("errors.noInternetSendMessages"));
      return false;
    }
    try {
      setIsLoading(true);
      const conversationId = selectedConversation.conversationId;
      const res = await request(conversationId);
      if (res.status === 200 && res.data?.message) {
        // The updated message (or the tombstone). upsertMessages also
        // refreshes every loaded quote of it.
        if (isConversationOpen(conversationId)) {
          upsertMessages([res.data.message]);
          saveCurrentMessagesToCache(authState?.user?._id, conversationId);
        }
        return true;
      }
      Alert.alert(t("common.error"), t(failedKey));
      return false;
    } catch (e: any) {
      if (e.networkError === "TIMEOUT") {
        Alert.alert(
          t("errors.connectionTimeoutTitle"),
          t("errors.connectionTimeoutMessage")
        );
      } else if (e.networkError !== "NO_INTERNET") {
        console.log("Message action failed: ", e.response?.data?.error || e.message);
        Alert.alert(t("common.error"), t(failedKey));
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const editMessage = (messageId: string, message: string) =>
    run(
      (conversationId) =>
        axiosClient.patch(`/conversations/${conversationId}/messages/${messageId}`, {
          message,
        }),
      "conversation.messageActions.editFailed"
    );

  const deleteForEveryone = (messageId: string) =>
    run(
      (conversationId) =>
        axiosClient.delete(`/conversations/${conversationId}/messages/${messageId}`),
      "conversation.messageActions.deleteFailed"
    );

  return { editMessage, deleteForEveryone, isLoading };
};

export default useMessageActions;
