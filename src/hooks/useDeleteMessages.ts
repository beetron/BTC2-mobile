import axiosClient from "@/src/utils/axiosClient";
import { useState } from "react";
import { Alert } from "react-native";
import { useAuth } from "@/src/context/AuthContext";
import FriendStore from "@/src/zustand/friendStore";
import { removeMessagesCache } from "@/src/utils/messageCache";
import { useNetwork } from "@/src/context/NetworkContext";

const useDeleteMessages = () => {
  const [isLoading, setisLoading] = useState(false);
  const { isConnected } = useNetwork();
  const { authState } = useAuth();
  const { selectedFriend, setMessages, setMessageId } = FriendStore();

  const deleteMessages = async (messageId: string): Promise<boolean> => {
    try {
      setisLoading(true);

      if (!messageId) return false;

      if (!isConnected) {
        Alert.alert(
          "No Internet Connection",
          "Please check your connection to delete messages"
        );
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
          const friendId = selectedFriend?._id;
          if (userId && friendId) {
            await removeMessagesCache(userId, friendId);
            // Immediately clear in-memory messages so conversation UI re-renders
            setMessages([]);
            // Ensure messageId is reset in case UI relies on it
            setMessageId(null);
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
          "Connection Timeout",
          "Request took too long. Please try again"
        );
      } else if (error.networkError === "NO_INTERNET") {
        // Already alerted in pre-flight check
      } else if (error.data && error.data.error) {
        console.error("Error deleting message:", error.data.message);
        Alert.alert("Error", error.data.message);
      }
      return false;
    } finally {
      setisLoading(false);
    }
  };
  return { deleteMessages, isLoading };
};

export default useDeleteMessages;
