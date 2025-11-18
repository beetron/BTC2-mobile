import { Alert } from "react-native";
import axiosClient from "../utils/axiosClient";
import { useState } from "react";
import { useNetwork } from "@/src/context/NetworkContext";

const useBlockUser = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { isConnected } = useNetwork();

  const blockUser = async (friendId: string): Promise<boolean> => {
    try {
      setIsLoading(true);

      if (!isConnected) {
        Alert.alert(
          "No Internet Connection",
          "Please check your connection and try again"
        );
        return false;
      }

      const response = await axiosClient.put(`/users/blockuser/${friendId}`);

      if (response.status === 200) {
        if (response.data && response.data.message) {
          Alert.alert("Success", response.data.message);
        } else {
          Alert.alert("Success", "User blocked successfully");
        }
        return true;
      }

      // Non-200 fallback
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
        // already alerted above
      } else if (
        error.response &&
        error.response.data &&
        error.response.data.error
      ) {
        Alert.alert("Error", error.response.data.error);
      } else {
        Alert.alert("Error", "An unexpected error occurred");
      }
      console.error("Error in useBlockUser:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { blockUser, isLoading };
};

export default useBlockUser;
