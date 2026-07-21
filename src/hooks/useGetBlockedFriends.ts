import { useEffect, useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import axiosClient from "../utils/axiosClient";
import { Alert } from "react-native";
import useGetProfileImage from "./useGetProfileImage";
import { useNetwork } from "@/src/context/NetworkContext";
import { useTranslation } from "./useTranslation";

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
  const { t } = useTranslation();

  const getBlockedFriends = useCallback(async () => {
    try {
      setIsLoading(true);

      if (!isConnected) {
        Alert.alert(t("errors.noInternetTitle"), t("errors.noInternetLoadBlocked"));
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
          t("errors.connectionTimeoutTitle"),
          t("errors.connectionTimeoutMessage")
        );
      } else if (error.networkError === "NO_INTERNET") {
        Alert.alert(t("errors.noInternetTitle"), t("errors.noInternetGeneric"));
      } else {
        console.error(
          "Error fetching blocked users:",
          error.response?.data || error.message
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, t]);

  useFocusEffect(
    useCallback(() => {
      console.log("useGetBlockedFriends triggered", new Date());
      getBlockedFriends();
    }, [getBlockedFriends])
  );

  return { blockedFriends, isLoading, getBlockedFriends };
};

export default useGetBlockedFriends;
