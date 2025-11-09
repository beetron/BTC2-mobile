import { useState, useEffect, useCallback } from "react";
import axiosClient from "../utils/axiosClient";
import FriendStore from "../zustand/friendStore";
import { useAuth } from "../context/AuthContext";
import { Alert } from "react-native";
import { useNetwork } from "@/src/context/NetworkContext";

const useGetMessages = () => {
  const { authState } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { selectedFriend, messages, setMessages, shouldRender, setMessageId } =
    FriendStore();
  const { isConnected } = useNetwork();

  const getMessages = useCallback(async () => {
    if (selectedFriend) {
      try {
        setIsLoading(true);

        if (!isConnected) {
          Alert.alert(
            "No Internet Connection",
            "Please check your connection to load messages"
          );
          setIsLoading(false);
          return;
        }

        const res = await axiosClient.get(
          `/messages/get/${selectedFriend._id}`
        );
        if (res.status === 200) {
          setMessages(res.data);

          // Set the most recent message ID for useDeleteMessages hook
          if (res.data.length > 0) {
            // 0 here because backend returns messages in descending order
            const mostRecentMessageId = res.data[0];
            setMessageId(mostRecentMessageId._id);
          } else {
            setMessageId(null);
          }
        } else {
          Alert.alert("Error", "Failed to get messages");
        }

        setIsLoading(false);
      } catch (error: any) {
        if (error.networkError === "TIMEOUT") {
          Alert.alert(
            "Connection Timeout",
            "Request took too long. Please try again"
          );
        } else if (error.networkError === "NO_INTERNET") {
          // Already alerted in pre-flight check
        } else {
          console.log("Error: ", error.response?.data?.error || error.message);
        }
      } finally {
        setIsLoading(false);
      }
    }
  }, [
    authState?.authenticated,
    isConnected,
    selectedFriend,
    setMessages,
    setMessageId,
  ]);

  useEffect(() => {
    getMessages();
  }, [shouldRender, getMessages]);

  return { getMessages, messages, isLoading };
};

export default useGetMessages;
