import { Platform } from "react-native";
import * as Notifications from "expo-notifications";

interface Friend {
  unreadCount: number;
}

const calculateAndSetBadgeCount = async (friends: Friend[]): Promise<void> => {
  try {
    const totalUnreadCount = friends.reduce(
      (sum: number, friend: Friend) => sum + (friend.unreadCount || 0),
      0
    );

    if (totalUnreadCount && Platform.OS === "ios") {
      await Notifications.setBadgeCountAsync(totalUnreadCount);
      console.log("Badge set to: ", totalUnreadCount);
    }
  } catch (error) {
    console.error("Error setting badge count: ", error);
  }
};

export default calculateAndSetBadgeCount;
