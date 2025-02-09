import { View, Text, ScrollView } from "react-native";
import { useCallback, useState, useEffect } from "react";
import useGetMyFriends from "@/hooks/useGetMyFriends";
import Friend from "./Friend";
import { useFocusEffect } from "@react-navigation/native";
import { useAppStateListener } from "@/app/context/AppStateContext";

interface Friend {
  _id: string;
  nickname: string;
  profilePhoto: string;
  unreadMessages: boolean;
  updatedAt: string;
}

const FriendContainer = () => {
  const { myFriends, isLoading, getMyFriends } = useGetMyFriends();
  const [sortedFriends, setSortedFriends] = useState<Friend[]>([]);

  // Run Effect when screen is back in focus
  useFocusEffect(
    useCallback(() => {
      getMyFriends();
      console.log("useFocusEffecT called");
    }, [getMyFriends])
  );

  // Run when App State is active again
  useAppStateListener(getMyFriends);

  // Sort friends by most recent messages
  useEffect(() => {
    if (myFriends.length > 0) {
      // Sort friends by recent messages
      const sorted = myFriends.sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
      setSortedFriends(sorted);
    }
  }, [myFriends]);

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-3xl text-btc100">Loading...</Text>
      </View>
    );
  } else {
    return (
      <ScrollView className="flex-1">
        <View className="flex-1 w-full">
          {sortedFriends.map((friend) => (
            <Friend key={friend._id} friend={friend} />
          ))}
        </View>
      </ScrollView>
    );
  }
};

export default FriendContainer;
