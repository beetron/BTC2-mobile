import { View, Text, TouchableOpacity, Alert } from "react-native";
import React from "react";
import { StyleSheet, Image } from "react-native";
import { useRouter } from "expo-router";
import friendStore from "../../zustand/friendStore";

const placeholderImage = require("../assets/images/placeholder_profile_pic.png");

const Friend = ({
  friend,
}: {
  friend: {
    _id: string;
    nickname: string;
    profilePhoto: string;
    unreadMessages: boolean;
  };
}) => {
  const { nickname, profilePhoto, unreadMessages } = friend;
  const { setSelectedFriend } = friendStore();
  const router = useRouter();

  // setSelectedFriend via Zustand before push
  const handleOnPress = () => {
    setSelectedFriend(friend);
    router.replace("../screens/conversation");
  };

  return (
    <TouchableOpacity onPress={handleOnPress}>
      <View className="flex-row items-center p-2 m-1 border-0 border-btc200">
        <View className="flex-row justify-start ml-3">
          <Image source={placeholderImage} className="w-16 h-16" />
        </View>
        <View className="flex-row justify-start ml-4">
          <Text className="text-btc100 text-xl font-funnel-semi-bold">
            {nickname}
          </Text>
        </View>
        <View className="flex-1 justify-end flex-row">
          {unreadMessages ? (
            <Text className="text-btc200 font-funnel-medium">
              Unread Message(s)
            </Text>
          ) : (
            <Text className="text-btc200 font-funnel-medium"></Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  friend: {
    flex: 1,
    justifyContent: "center",
  },
});

export default Friend;
