import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { API_URL } from "../constants/api";
import FriendStore from "../zustand/friendStore";
import { useAuth } from "../context/AuthContext";
import { Alert } from "react-native";

interface Friend {
  _id: string;
  messages: string[];
}

interface FriendStoreProps {
  selectedFriend: Friend;
}

const useGetMessages = () => {
  const { authState } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { selectedFriend, messages, setMessages, shouldRender } = FriendStore();

  const getMessages = useCallback(async () => {
    if (selectedFriend) {
      try {
        setIsLoading(true);
        const res = await axios.get(
          `${API_URL}/api/messages/get/${selectedFriend._id}`
        );
        if (res.status === 200) {
          setMessages([...messages, ...res.data]);
        } else {
          Alert.alert("Error", "Failed to get messages");
          // ADD REDIRECT LOGIN FOR PRODUCTION
        }

        setIsLoading(false);
      } catch (e) {
        console.log("Error: ", e.response?.data?.error || e.message);
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
