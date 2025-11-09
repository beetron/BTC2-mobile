import { useState } from "react";
import axiosClient from "../utils/axiosClient";
import FriendStore from "../zustand/friendStore";
import { useAuth } from "../context/AuthContext";
import { Alert } from "react-native";
import { useNetwork } from "@/src/context/NetworkContext";

const useSendMessage = () => {
  const { authState } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { selectedFriend, setShouldRender } = FriendStore();
  const { isConnected } = useNetwork();

  const sendMessage = async (message: string) => {
    try {
      setIsLoading(true);

      if (!isConnected) {
        Alert.alert(
          "No Internet Connection",
          "Please check your connection to send messages"
        );
        setIsLoading(false);
        return;
      }

      if (authState?.authenticated && selectedFriend && message) {
        const res = await axiosClient.post(
          `/messages/send/${selectedFriend._id}`,
          { message: message }
        );
        if (res.status === 200) {
          setIsLoading(false);
          console.log("setShouldRender will run now....");
          setShouldRender();
        } else {
          Alert.alert("Error", "Failed to send message");
        }
        setIsLoading(false);
      }
    } catch (e: any) {
      if (e.networkError === "TIMEOUT") {
        Alert.alert(
          "Connection Timeout",
          "Request took too long. Please try again"
        );
      } else if (e.networkError === "NO_INTERNET") {
        // Already alerted in pre-flight check
      } else {
        console.log("Error: ", e.response?.data?.error || e.message);
      }
    } finally {
      setIsLoading(false);
    }
  };
  return { sendMessage, isLoading };
};

export default useSendMessage;
