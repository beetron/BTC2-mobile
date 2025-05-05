import { useState, useEffect, useCallback } from "react";
import axiosClient from "../utils/axiosClient";
import FriendStore from "../zustand/friendStore";
import { useAuth } from "../context/AuthContext";
import { Alert } from "react-native";
import calculateAndSetBadgeCount from "../utils/calculateAndSetBadgeCount";

const useGetMessages = () => {
  const { authState } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { selectedFriend, messages, setMessages, shouldRender, setMessageId } =
    FriendStore();

  const getMessages = useCallback(async () => {
    if (selectedFriend) {
      try {
        setIsLoading(true);
        const res = await axiosClient.get(
          `/messages/get/${selectedFriend._id}`
        );
        if (res.status === 200) {
          // Set badge count using utility function
          await calculateAndSetBadgeCount(res.data);

          setMessages([...messages, ...res.data]);

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
        console.log("Error: ", error.response?.data?.error || error.message);
        // Alert.alert("Error", e.response?.data?.error || e.message);
      } finally {
        setIsLoading(false);
      }
    }
  }, [authState?.authenticated]);

  useEffect(() => {
    getMessages();
  }, [shouldRender]);

  return { getMessages, messages, isLoading };
};

export default useGetMessages;
