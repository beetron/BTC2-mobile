import { Alert } from "react-native";
import axiosClient from "../utils/axiosClient";
import { useState } from "react";
import { useNetwork } from "@/src/context/NetworkContext";

const useAddGroupMembers = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { isConnected } = useNetwork();

  const addGroupMembers = async (
    conversationId: string,
    memberIds: string[]
  ): Promise<boolean> => {
    try {
      setIsLoading(true);

      if (!isConnected) {
        Alert.alert(
          "No Internet Connection",
          "Please check your connection and try again"
        );
        return false;
      }

      await axiosClient.put(`/conversations/${conversationId}/members`, {
        memberIds,
      });
      return true;
    } catch (error: any) {
      if (error.networkError === "TIMEOUT") {
        Alert.alert(
          "Connection Timeout",
          "Request took too long. Please try again"
        );
      } else if (error.networkError === "NO_INTERNET") {
        // already alerted above
      } else if (error.response?.data?.error) {
        Alert.alert("Error", error.response.data.error);
      } else {
        Alert.alert("Error", "Failed to add members");
      }
      console.error("Error in useAddGroupMembers:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { addGroupMembers, isLoading };
};

export default useAddGroupMembers;
