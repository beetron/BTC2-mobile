import { View, Text, TouchableOpacity, Alert } from "react-native";
import React from "react";
import { useRouter } from "expo-router";
import friendStore from "../../zustand/friendStore";
import { Image } from "expo-image";
import { placeholderProfileImage } from "@/constants/images";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

const Friend = ({
  friend,
}: {
  friend: {
    _id: string;
    nickname: string;
    profileImage: string;
    profileImageData: string;
    unreadCount: number;
  };
}) => {
  const { nickname, unreadCount } = friend;
  const { setSelectedFriend } = friendStore();
  const router = useRouter();

  // setSelectedFriend via Zustand before push
  const handleOnPress = () => {
    setSelectedFriend(friend);
    router.push("../screens/conversation");
  };

  return (
    <TouchableOpacity onPress={handleOnPress}>
      <View className="flex-1 bg-btc500 m-2">
        <View className="flex-row items-center justify-start w-full">
          <View className="mr-6">
            {friend.profileImageData ? (
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
          <Text className="text-btc100 text-xl font-funnel-semi-bold mr-6">
            {nickname}
          </Text>
          {unreadCount !== 0 ? (
            <View className="flex-row">
              <MaterialCommunityIcons
                name="message-alert-outline"
                size={24}
                color="#75E6DA"
              />
              <Text className="text-btc100 text-xl font-funnel-semi-bold ml-2">
                + {unreadCount}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default Friend;
