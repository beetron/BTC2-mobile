import { useEffect, useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import axiosClient from "../utils/axiosClient";
import { Alert } from "react-native";
import useGetProfileImage from "./useGetProfileImage";
import { useNetwork } from "@/src/context/NetworkContext";

interface Friend {
  _id: string;
  uniqueId: string;
  nickname: string;
  profileImage: string;
  profileImageData?: string;
}

const useGetBlockedFriends = () => {
  const [blockedFriends, setBlockedFriends] = useState<Friend[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { getProfileImage } = useGetProfileImage();
  const { isConnected } = useNetwork();

  const getBlockedFriends = useCallback(async () => {
    try {
      setIsLoading(true);

      if (!isConnected) {
        Alert.alert(
          "No Internet Connection",
          "Please check your connection to load blocked users"
        );
        setIsLoading(false);
        return;
      }

      const res = await axiosClient.get("/users/blockedusers");

      const friendsWithImages = await Promise.all(
        res.data.map(async (friend: Friend) => {
          let imageData = null;
          if (friend.profileImage) {
            try {
              imageData = await getProfileImage(friend.profileImage);
            } catch (imageError) {
              console.error("Error loading blocked user image:", imageError);
            }
          }
          return {
            ...friend,
            profileImageData: imageData,
          };
        })
      );

      setBlockedFriends(friendsWithImages);
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
      } else {
        console.error(
          "Error fetching blocked users:",
          error.response?.data || error.message
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, [isConnected]);

  useFocusEffect(
    useCallback(() => {
      console.log("useGetBlockedFriends triggered", new Date());
      getBlockedFriends();
    }, [getBlockedFriends])
  );

  return { blockedFriends, isLoading, getBlockedFriends };
};

export default useGetBlockedFriends;
