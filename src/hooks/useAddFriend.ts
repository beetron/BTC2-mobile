import axiosClient from "../utils/axiosClient";
import { useState } from "react";
import { Alert } from "react-native";
import { useNetwork } from "@/src/context/NetworkContext";

const useAddFriend = () => {
  const [loading, setLoading] = useState(false);
  const { isConnected } = useNetwork();

  const addFriend = async (friendUniqueId: string): Promise<boolean> => {
    try {
      setLoading(true);
      if (!friendUniqueId) return false;

      if (!isConnected) {
        Alert.alert(
          "No Internet Connection",
          "Please check your connection and try again"
        );
        return false;
      }

      const response = await axiosClient.put(
        `/users/addfriend/${friendUniqueId}`
      );
      if (response.status === 200) {
        Alert.alert("Friend request sent");
        return true;
      }
      return false;
    } catch (error: any) {
      console.log("Error in useAddFriend: ", error);

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
      } else {
        Alert.alert("Error", "An error occurred while adding friend.");
      }
      return false;
    } finally {
      setLoading(false);
    }
  };
  return { addFriend, loading };
};

export default useAddFriend;
