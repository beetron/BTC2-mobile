import FriendContainer from "@/app/components/FriendContainer";
import { View } from "react-native";
import requestNotificationPermission from "@/utils/requestNotificationPermission";
import { useEffect } from "react";

// Home screeen with friend list
const Index = () => {
  useEffect(() => {
    requestNotificationPermission();
  });

  return (
    <View className="flex-1 bg-btc500">
      <FriendContainer />
    </View>
  );
};
export default Index;
