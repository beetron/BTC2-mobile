import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../app/context/AuthContext";

// Get API URL
export const API_URL =
  process.env.EXPO_PUBLIC_ENV === "development"
    ? process.env.EXPO_PUBLIC_API_DEV_URL
    : process.env.EXPO_PUBLIC_API_URL;

interface Friend {
  _id: string;
  uniqueId: string;
  nickname: string;
  profilePhoto: string;
  unreadMessages: boolean;
  updatedAt: string;
}

const useGetMyFriends = () => {
  const { authState } = useAuth();
  const [myFriends, setMyFriends] = useState<Friend[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const getMyFriends = useCallback(async () => {
    try {
      if (authState?.authenticated === true) {
        const res = await axios.get(`${API_URL}/api/users/friendlist`);
        setMyFriends(res.data);
        setIsLoading(false);
      }
    } catch (e) {
      console.log("Error: ", e.response?.data?.error || e.message);
    }
  }, [authState?.authenticated]);

  useEffect(() => {
    console.log("useGetMyFriends" + new Date());
    getMyFriends();
  }, [getMyFriends]);

  return { myFriends, isLoading, getMyFriends };
};

export default useGetMyFriends;
