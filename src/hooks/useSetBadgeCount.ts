import { useState, useCallback } from "react";
import axiosClient from "../utils/axiosClient";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { useNetwork } from "@/src/context/NetworkContext";

interface Friend {
  unreadCount: number;
}

const applyBadgeCount = async (totalUnreadCount: number) => {
  if (typeof totalUnreadCount === "number" && Platform.OS === "ios") {
    await Notifications.setBadgeCountAsync(totalUnreadCount);
  }
};

const useSetBadgeCount = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { isConnected } = useNetwork();

  // Fetches /users/friendlist itself -- for call sites (e.g.
  // ConversationMessages, after marking a conversation read) that don't
  // already have a fresh friend list in hand.
  const setBadgeCount = useCallback(async () => {
    try {
      setIsLoading(true);

      if (!isConnected) {
        setIsLoading(false);
        return;
      }

      const res = await axiosClient.get("/users/friendlist");

      const friends = res.data as Friend[];

      const totalUnreadCount = friends.reduce(
        (sum: number, friend: Friend) => sum + (friend.unreadCount || 0),
        0
      );

      await applyBadgeCount(totalUnreadCount);
    } catch (error: any) {
      // Silently fail - this is a background operation
      console.debug("Badge count update failed silently");
    } finally {
      setIsLoading(false);
    }
  }, [isConnected]);

  // For call sites that already have a fresh friend list in hand (e.g.
  // ConversationListContainer, right after useGetMyFriends resolves) --
  // updates the OS badge with no extra network call, instead of redundantly
  // re-fetching /users/friendlist that useGetMyFriends already just fetched.
  const setBadgeCountFromFriends = useCallback((friends: Friend[]) => {
    const totalUnreadCount = friends.reduce(
      (sum: number, friend: Friend) => sum + (friend.unreadCount || 0),
      0
    );
    applyBadgeCount(totalUnreadCount);
  }, []);

  return { isLoading, setBadgeCount, setBadgeCountFromFriends };
};

export default useSetBadgeCount;
