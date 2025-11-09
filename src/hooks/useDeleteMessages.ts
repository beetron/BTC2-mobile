import axiosClient from "@/src/utils/axiosClient";
import { useState } from "react";
import { Alert } from "react-native";
import { useNetwork } from "@/src/context/NetworkContext";

const useDeleteMessages = () => {
  const [isLoading, setisLoading] = useState(false);
  const { isConnected } = useNetwork();

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
