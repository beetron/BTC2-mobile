import { View, Text, ScrollView } from "react-native";
import React from "react";
import useGetMyFriends from "@/hooks/useGetMyFriends";
import Friend from "./Friend";
import { useFocusEffect } from "@react-navigation/native";

interface FriendProps {
  friendList: any;
}

const FriendContainer = () => {
  // Get user's friend list from API
  const { myFriends, isLoading } = useGetMyFriends();

  // Sort friends by recent messages
  const sortedFriends = myFriends.sort(
    (a: any, b: any) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

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
          {sortedFriends.map((friend: any) => (
            <Friend key={friend._id} friend={friend} />
          ))}
        </View>
      </ScrollView>
    );
  }
};

export default FriendContainer;
