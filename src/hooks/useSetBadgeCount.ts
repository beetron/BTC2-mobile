import { useCallback } from "react";
import axiosClient from "../utils/axiosClient";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { useNetwork } from "@/src/context/NetworkContext";

interface UnreadRow {
  unreadCount: number;
}

// The app icon badge counts unread messages in every conversation, direct
// and group -- the same total the server puts on push notifications and
// returns from mark-read. Counting only direct chats (the friend list)
// made the icon flip between two numbers.
export const applyBadgeCount = async (totalUnreadCount: number) => {
  if (typeof totalUnreadCount === "number" && Platform.OS === "ios") {
    await Notifications.setBadgeCountAsync(totalUnreadCount);
  }
};

const sumUnread = (rows: UnreadRow[]) =>
  rows.reduce((sum, row) => sum + (row.unreadCount || 0), 0);

const useSetBadgeCount = () => {
  const { isConnected } = useNetwork();

  // Fetches GET /conversations (direct and group rows, each with its
  // unreadCount) -- for call sites that don't already have both lists.
  const setBadgeCount = useCallback(async () => {
    if (!isConnected) return;
    try {
      const res = await axiosClient.get("/conversations");
      await applyBadgeCount(sumUnread(res.data || []));
    } catch {
      // Background operation: the next refresh or push sets it
      console.debug("Badge count update failed silently");
    }
  }, [isConnected]);

  return { setBadgeCount };
};

export default useSetBadgeCount;
