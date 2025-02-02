import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../app/context/AuthContext";

// Get API URL
export const API_URL =
  process.env.EXPO_PUBLIC_ENV === "development"
    ? process.env.EXPO_PUBLIC_API_DEV_URL
    : process.env.EXPO_PUBLIC_API_URL;

const useGetMyFriends = () => {
  const [myFriends, setMyFriends] = useState([]);
  const { authState } = useAuth();

  useEffect(() => {
    const getMyFriends = async () => {
      try {
        if (authState?.authenticated === true) {
          const res = await axios.get(`${API_URL}/api/users/friendlist`);
          const myFriends = res.data;

          setMyFriends(myFriends);
        }
      } catch (e) {
        console.log("Error: ", e.response.data.error);
      }
    };
    getMyFriends();

    console.log("useGetMyFriends");
  }, []);

  return { myFriends };
};

export default useGetMyFriends;
