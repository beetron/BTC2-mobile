import { Alert } from "react-native";
import axiosClient from "../utils/axiosClient";
import { useState } from "react";
import { useNetwork } from "@/src/context/NetworkContext";

const useUnblockUser = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { isConnected } = useNetwork();

  const unblockUser = async (friendId: string): Promise<boolean> => {
    try {
      setIsLoading(true);

      if (!isConnected) {
        Alert.alert(
          "No Internet Connection",
          "Please check your connection and try again"
        );
        return false;
      }

      const response = await axiosClient.put(`/users/unblockuser/${friendId}`);

      if (response.status === 200) {
        // If backend returns message, show it
        if (response.data && response.data.message) {
          Alert.alert("Success", response.data.message);
        } else {
          Alert.alert("Success", "User unblocked successfully");
        }
        return true;
      }

      // If not 200, show error if present
      if (response.data && response.data.error) {
        Alert.alert("Error", response.data.error);
      }

      return false;
    } catch (error: any) {
      if (error.networkError === "TIMEOUT") {
        Alert.alert(
          "Connection Timeout",
          "Request took too long. Please try again"
        );
      } else if (error.networkError === "NO_INTERNET") {
        // Already handled
      } else if (
        error.response &&
        error.response.data &&
        error.response.data.error
      ) {
        Alert.alert("Error", error.response.data.error);
      } else {
        Alert.alert("Error", "An unexpected error occurred");
      }
      console.error("Error in useUnblockUser:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { unblockUser, isLoading };
};

export default useUnblockUser;
