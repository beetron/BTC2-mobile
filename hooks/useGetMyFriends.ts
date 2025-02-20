import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../app/context/AuthContext";
import { API_URL } from "../constants/api";

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
      }
    } catch (e) {
      console.log("Error: ", e.response?.data?.error || e.message);
    } finally {
      setIsLoading(false);
    }
  }, [authState?.authenticated]);

  useEffect(() => {
    console.log("useGetMyFriends" + new Date());
    getMyFriends();
  }, [getMyFriends]);

  return { myFriends, isLoading, getMyFriends };
};

export default useGetMyFriends;
