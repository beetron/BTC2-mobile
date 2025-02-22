import { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../constants/api";
import useFriendStore from "../zustand/useFriendStore";
import { Alert } from "react-native";

interface Friend {
  _id: string;
  messages: string[];
}

interface FriendStoreProps {
  selectedFriend: Friend;
}

const useGetMessages = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { selectedFriend, messages, setMessages, shouldRender } =
    useFriendStore();

  useEffect(() => {
    const getMessages = async () => {
      if (selectedFriend) {
        try {
          setIsLoading(true);

          const response = await axios.get(
            `${API_URL}/api/messages/${selectedFriend._id}`
          );

          if (response.status !== 200) {
            const data = response.data;
          } else {
            Alert.alert("Error", "Failed to get messages");
            // ADD REDIRECT LOGIN FOR PRODUCTION
          }

          setMessages(response.data);
          setIsLoading(false);
        } catch (e) {
          setIsLoading(false);
        }
        getMessages();
      }
    };
  }, [setMessages, shouldRender]);

  return { messages, isLoading };
};

export default useGetMessages;
