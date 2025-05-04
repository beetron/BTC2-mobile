import axiosClient from "@/utils/axiosClient";
import { useState } from "react";
import { Alert } from "react-native";

const useDeleteMessages = () => {
  const [isLoading, setisLoading] = useState(false);
  const deleteMessages = async (messageId: string): Promise<boolean> => {
    try {
      setisLoading(true);

      if (!messageId) return false;

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
      if (error.data && error.data.error) {
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
