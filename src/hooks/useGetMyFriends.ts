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
  // Separates the very first fetch from every later refresh -- see
  // isInitialLoad below.
  const [hasCompletedFirstFetch, setHasCompletedFirstFetch] = useState(false);
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
      setHasCompletedFirstFetch(true);
      isFetchingRef.current = false;
    }
  }, [isConnected, t]);

  useFocusEffect(
    useCallback(() => {
      getMyFriends();
    }, [getMyFriends])
  );

  // Only the first fetch should blank the screen. Later refreshes (focus,
  // socket, app foreground) resolve behind whatever is already rendered, so
  // callers can keep showing the rows they have instead of tearing the list
  // down for a spinner and rebuilding it -- which is what made swiping back
  // from a conversation flash: the native pop gesture hands control to JS
  // only *after* it finishes, so the refetch was fully exposed rather than
  // hidden behind a transition.
  //
  // Set in `finally`, so a failed first attempt flips it too -- the empty
  // state is a better answer than a spinner that never resolves.
  const isInitialLoad = isLoading && !hasCompletedFirstFetch;

  return { myFriends, isLoading, isInitialLoad, getMyFriends };
};

export default useGetMyFriends;
