import axiosClient from "@/src/utils/axiosClient";
import { useState } from "react";
import { Alert } from "react-native";
import { useAuth } from "@/src/context/AuthContext";
import conversationStore from "@/src/zustand/conversationStore";
import { removeMessagesCache } from "@/src/utils/messageCache";
import { useNetwork } from "@/src/context/NetworkContext";
import { useTranslation } from "@/src/hooks/useTranslation";

const useDeleteMessages = () => {
  const [isLoading, setisLoading] = useState(false);
  const { isConnected } = useNetwork();
  const { authState } = useAuth();
  const { t } = useTranslation();
  const { selectedConversation, setMessages, setLatestMessageId } =
    conversationStore();

  const deleteMessages = async (messageId: string): Promise<boolean> => {
    try {
      setisLoading(true);

      if (!messageId) return false;

      if (!isConnected) {
        Alert.alert(t("errors.noInternetTitle"), t("errors.noInternetDeleteMessages"));
        return false;
      }

      // API call to delete messages
      const response = await axiosClient.delete(
        `/messages/delete/${messageId}`
      );

      if (response.status === 200) {
        console.log("useDeleteMessage successful");

        // Clear local cached messages for this conversation so UI reflects deletion immediately
        try {
          const userId = authState?.user?._id;
          const conversationId = selectedConversation?.conversationId;
          if (userId && conversationId) {
            await removeMessagesCache(userId, conversationId);
            // Immediately clear in-memory messages so conversation UI re-renders
            setMessages([]);
            // Ensure latestMessageId is reset in case UI relies on it
            setLatestMessageId(null);
          }
        } catch (err) {
          // Non-fatal: if cache cannot be removed the server still deleted messages
          console.warn("Failed to update message cache after delete:", err);
        }

        return true;
      }
      return false;
    } catch (error: any) {
      if (error.networkError === "TIMEOUT") {
        Alert.alert(
          t("errors.connectionTimeoutTitle"),
          t("errors.connectionTimeoutMessage")
        );
      } else if (error.networkError === "NO_INTERNET") {
        // Already alerted in pre-flight check
      } else if (error.data && error.data.error) {
        console.error("Error deleting message:", error.data.message);
        Alert.alert(t("common.error"), error.data.message);
      }
      return false;
    } finally {
      setisLoading(false);
    }
  };
  return { deleteMessages, isLoading };
};

export default useDeleteMessages;
