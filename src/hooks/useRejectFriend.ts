import { Alert } from "react-native";
import axiosClient from "../utils/axiosClient";
import { useState } from "react";
import { useNetwork } from "@/src/context/NetworkContext";

const useRejectFriend = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { isConnected } = useNetwork();

  const rejectFriend = async (uniqueId: string): Promise<boolean> => {
    try {
      setIsLoading(true);

      if (!isConnected) {
        Alert.alert(
          "No Internet Connection",
          "Please check your connection and try again"
        );
        return false;
      }

      const response = await axiosClient.put(`/users/rejectfriend/${uniqueId}`);

      if (response.status === 200) {
        Alert.alert("Rejected friend request");
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
      } else if (
        error.response &&
        error.response.data &&
        error.response.data.error
      ) {
        Alert.alert("Error", error.response.data.error);
        console.error("Error in useRejectFriend: ", error);
      } else {
        Alert.alert("Error", "An unexpected error occurred.");
        console.error("Unexpected error in useRejectFriend: ", error);
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { rejectFriend, isLoading };
};

export default useRejectFriend;
