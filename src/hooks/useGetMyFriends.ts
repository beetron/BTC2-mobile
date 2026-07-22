import { useState, useCallback, useRef } from "react";
import axiosClient from "../utils/axiosClient";
import { useRouter, useFocusEffect } from "expo-router";
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
  unreadCount: number;
  updatedAt: string;
}

const useGetMyFriends = () => {
  const [myFriends, setMyFriends] = useState<Friend[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();
  const { getProfileImage } = useGetProfileImage();
  const { isConnected } = useNetwork();
  const { t } = useTranslation();
  // Guards against overlapping requests -- rapidly switching tabs re-fires
  // the focus effect below before a previous /users/friendlist call (plus
  // its per-friend image fetches) has resolved, otherwise stacking more of
  // the same request on every switch instead of reusing the one in flight.
  const isFetchingRef = useRef(false);

  const getMyFriends = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    try {
      setIsLoading(true);

      if (!isConnected) {
        Alert.alert(t("errors.noInternetTitle"), t("errors.noInternetLoadFriends"));
        setIsLoading(false);
        return;
      }

      const res = await axiosClient.get("/users/friendlist");

      // Call getProfileImage hook for each friend's profile image
      const friendsWithImages = await Promise.all(
        res.data.map(async (friend: Friend, index: number) => {
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
          t("errors.connectionTimeoutTitle"),
          t("errors.connectionTimeoutMessage")
        );
      } else if (error.networkError === "NO_INTERNET") {
        Alert.alert(t("errors.noInternetTitle"), t("errors.noInternetGeneric"));
      } else if (error.message !== "Unauthorized") {
        console.log("Error: ", error.response?.data?.error || error.message);
      }
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, [isConnected, t]);

  useFocusEffect(
    useCallback(() => {
      getMyFriends();
    }, [getMyFriends])
  );

  return { myFriends, isLoading, getMyFriends };
};

export default useGetMyFriends;
