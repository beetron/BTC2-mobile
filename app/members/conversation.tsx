import { View, Text } from "react-native";
import React from "react";

interface Friend {
  nickname: string;
  profilePhoto: string;
  unreadMessages: boolean;
  updatedAt: string;
}

const conversation = () => {
  return (
    <View>
      <Text>conversation</Text>
    </View>
  );
};

export default conversation;
