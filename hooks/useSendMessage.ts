import { useState } from "react";
import axiosClient from "../utils/axiosClient";
import FriendStore from "../zustand/friendStore";
import { useAuth } from "../context/AuthContext";
import { Alert } from "react-native";

const useSendMessage = () => {
  const { authState } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { selectedFriend, setShouldRender } = FriendStore();

  const sendMessage = async (message: string) => {
    try {
      setIsLoading(true);

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
    } catch (e) {
      console.log("Error: ", e.response?.data?.error || e.message);
      // Alert.alert("Error", e.response?.data?.error || e.message);
    } finally {
      setIsLoading(false);
    }
  };
  return { sendMessage, isLoading };
};

export default useSendMessage;
