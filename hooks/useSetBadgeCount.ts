import { useState, useCallback } from "react";
import axiosClient from "../utils/axiosClient";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// interface Friend {
//   _id: string;
//   uniqueId: string;
//   nickname: string;
//   profileImage: string;
//   profileImageData?: string;
//   unreadCount: number;
//   updatedAt: string;
// }

interface Friend {
  unreadCount: number;
}

const useSetBadgeCount = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const setBadgeCount = useCallback(async () => {
    try {
      console.log("setBadgeCount hook called");
      setIsLoading(true);
      const res = await axiosClient.get("/users/friendlist");
      console.log("API response data:", res.data);

      const friends = res.data as Friend[];

      const totalUnreadCount = friends.reduce(
        (sum: number, friend: Friend) => sum + (friend.unreadCount || 0),
        0
      );

      if (totalUnreadCount && Platform.OS === "ios") {
        await Notifications.setBadgeCountAsync(totalUnreadCount);
        console.log("Badge set to: ", totalUnreadCount);
      }
    } catch (error: any) {
      console.log("Error: ", error.response?.data?.error || error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { isLoading, setBadgeCount };
};

export default useSetBadgeCount;
