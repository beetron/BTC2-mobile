import { useEffect, useState, useCallback } from "react";
import axiosClient from "../utils/axiosClient";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "expo-router";
import useGetProfileImage from "./useGetProfileImage";
import { API_PROFILE_IMAGE_URL } from "../constants/api";

interface Friend {
  _id: string;
  uniqueId: string;
  nickname: string;
  profileImage: string;
  profileImageData?: string;
  unreadMessages: boolean;
  updatedAt: string;
}

const useGetMyFriends = () => {
  const { authState } = useAuth();
  const [myFriends, setMyFriends] = useState<Friend[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();
  const { getProfileImage } = useGetProfileImage();

  const getMyFriends = useCallback(async () => {
    try {
      if (authState?.authenticated === true) {
        const res = await axiosClient.get("/users/friendlist");
        console.log("API response data:", res.data);
  
        // Call getProfileImage hook for each friend's profile image
        const friendsWithImages = await Promise.all(
          res.data.map(async (friend: Friend, index: number) => {
            console.log(`Processing friend ${index}:`, friend);
            console.log("friend.profileImage: ", friend.profileImage);
  
            let imageData = null;
            if (friend.profileImage) {
              try {
                imageData = await getProfileImage(friend.profileImage);
              } catch (imageError) {
                console.error(`Error loading image for friend ${index}:`, imageError);
              }
            }
            return {
              ...friend, profileImageData: imageData
            };
          })
        );
        setMyFriends(friendsWithImages);
      }
    } catch (e) {
      console.log("Error: ", e.response?.data?.error || e.message);
      return router.replace("/guests/Login");
    } finally {
      setIsLoading(false);
    }
  }, [authState?.authenticated]);

  useEffect(() => {
    console.log("useGetMyFriends" + new Date());
    getMyFriends();
  }, []);

  return { myFriends, isLoading, getMyFriends };
};

export default useGetMyFriends;
