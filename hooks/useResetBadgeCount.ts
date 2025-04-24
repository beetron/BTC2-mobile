import { useCallback } from "react";
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";

/////////////////////////////////////////////
// Reset badge count
/////////////////////////////////////////////
const useResetBadgeCount = () => {
  const resetBadgeCount = useCallback(async () => {
    try {
      if (Platform.OS === "ios") {
        await Notifications.setBadgeCountAsync(0);
        console.log("Badge count reset");
      }
    } catch (error) {
      console.error("Error resetting badge count: ", error);
    }
  }, []);

  return { resetBadgeCount };
};

export default useResetBadgeCount;
