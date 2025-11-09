import { useEffect, useState, useCallback } from "react";
import axiosClient from "../utils/axiosClient";
import { useRouter, useFocusEffect } from "expo-router";
import { Alert } from "react-native";
import useGetProfileImage from "./useGetProfileImage";
import { useNetwork } from "@/src/context/NetworkContext";

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
  const { isConnected } = useNetwork();

  const getMyFriends = useCallback(async () => {
    try {
      setIsLoading(true);

      if (!isConnected) {
        Alert.alert(
          "No Internet Connection",
          "Please check your connection to load friends"
        );
        setIsLoading(false);
        return;
      }

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
          return {
            ...friend,
            profileImageData: imageData,
          };
        })
      );
      setMyFriends(friendsWithImages);
    } catch (error: any) {
      if (error.networkError === "TIMEOUT") {
        Alert.alert(
          "Connection Timeout",
          "Request took too long. Please try again"
        );
      } else if (error.networkError === "NO_INTERNET") {
        Alert.alert(
          "No Internet Connection",
          "Please check your connection and try again"
        );
      } else if (error.message !== "Unauthorized") {
        console.log("Error: ", error.response?.data?.error || error.message);
      }
    } finally {
      setIsLoading(false);
    }
  }, [isConnected]);

  useFocusEffect(
    useCallback(() => {
      console.log("useGetMyFriends" + new Date());
      getMyFriends();
    }, [getMyFriends])
  );

  return { myFriends, isLoading, getMyFriends };
};

export default useGetMyFriends;
