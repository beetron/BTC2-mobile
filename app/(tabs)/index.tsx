import { useEffect } from "react";
import FriendContainer from "@/components/FriendContainer";
import { View } from "react-native";
import useGetMyFriends from "@/hooks/useGetMyFriends";

// Home screeen with friend list
const Index = () => {
  // Get user's friend list from API
  const { myFriends } = useGetMyFriends();

  // useEffect(() => {
  //   getMyFriends();
  // }, [getMyFriends]);

  return (
    <View className="flex-1 justify-center items-center bg-btc500">
      <FriendContainer />
    </View>
  );
};
export default Index;
