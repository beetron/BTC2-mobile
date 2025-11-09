import { useState, useCallback } from "react";
import axiosClient from "../utils/axiosClient";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { useNetwork } from "@/src/context/NetworkContext";

interface Friend {
  unreadCount: number;
}

const useSetBadgeCount = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { isConnected } = useNetwork();

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

      if (typeof totalUnreadCount === "number" && Platform.OS === "ios") {
        await Notifications.setBadgeCountAsync(totalUnreadCount);
      }
    } catch (error: any) {
      // Silently fail - this is a background operation
      console.debug("Badge count update failed silently");
    } finally {
      setIsLoading(false);
    }
  }, [isConnected]);

  return { isLoading, setBadgeCount };
};

export default useSetBadgeCount;
