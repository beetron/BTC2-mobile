import { useEffect, useState, useCallback } from "react";
import axiosClient from "../utils/axiosClient";
import { useRouter } from "expo-router";
import useGetProfileImage from "./useGetProfileImage";

interface Friend {
  _id: string;
  uniqueId: string;
  nickname: string;
  profileImage: string;
  profileImageData?: string;
  unreadCount: number;
  updatedAt: string;
}

const useGetMyFriends = () => {
  const [myFriends, setMyFriends] = useState<Friend[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();
  const { getProfileImage } = useGetProfileImage();

  const getMyFriends = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await axiosClient.get("/users/friendlist");
      // console.log("API response data:", res.data);

      // Call getProfileImage hook for each friend's profile image
      const friendsWithImages = await Promise.all(
        res.data.map(async (friend: Friend, index: number) => {
          // console.log(`Processing friend ${index}:`, friend);
          // console.log("friend.profileImage: ", friend.profileImage);

          let imageData = null;
          if (friend.profileImage) {
            try {
              imageData = await getProfileImage(friend.profileImage);
            } catch (imageError) {
              console.error(
                `Error loading image for friend ${index}:`,
                imageError
              );
            }
          }
          setIsLoading(false);
          return {
            ...friend,
            profileImageData: imageData,
          };
        })
      );
      setMyFriends(friendsWithImages);
    } catch (error: any) {
      console.log("Error: ", error.response?.data?.error || error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    console.log("useGetMyFriends" + new Date());
    getMyFriends();
  }, []);

  return { myFriends, isLoading, getMyFriends };
};

export default useGetMyFriends;
