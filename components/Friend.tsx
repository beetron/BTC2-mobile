import { View, Text } from "react-native";
import React from "react";
import { Image } from "react-native";

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
  const { _id, nickname, profilePhoto, unreadMessages } = friend;
  return (
    <View className="flex-row items-center p-2 m-1 border-0 border-btc200">
      <View className="flex-row justify-start">
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
            Unread Messages
          </Text>
        ) : (
          <Text className="text-btc200 font-funnel-medium">
            No Unread Messages
          </Text>
        )}
      </View>
    </View>
    // <View className="flex-row items-center justify-center w-full p-2 m-1 left-2">
    //   <Image source={placeholderImage} className="w-16 h-16 mr-2" />
    //   <Text className="text-btc100 text-xl font-funnel-semi-bold">
    //     {nickname}
    //   </Text>
    //   {/* {unreadMessages && (
    //     <Text className="text-red-500 ml-2">Unread Messages</Text>
    //   )} */}
    //   <Text className="text-btc200 font-funnel-medium ml-5">
    //     Unread Messages
    //   </Text>
    // </View>
  );
};

export default Friend;
