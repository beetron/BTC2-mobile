import { View, Text, TouchableOpacity, Alert } from "react-native";
import React from "react";
import { useRouter } from "expo-router";
import friendStore from "../../zustand/friendStore";
import { Image } from "expo-image";
import { placeholderProfileImage } from "@/constants/images";

const Friend = ({
  friend,
}: {
  friend: {
    _id: string;
    nickname: string;
    profileImage: string;
    profileImageData: string;
    unreadMessages: boolean;
  };
}) => {
  const { nickname, unreadMessages } = friend;
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
          { friend.profileImageData ? (
          <Image
          source={{ uri: friend.profileImageData }}
          style={{ width: 50, height: 50, borderRadius: 50 }}
          className="bg-btc100"
          />
          ) : (
          <Image
          source={placeholderProfileImage}
          style={{ width: 50, height: 50, borderRadius: 50 }}
          className="bg-btc100"
          />
          )}
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

export default Friend;
