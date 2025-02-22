import { View, Text } from "react-native";
import React from "react";
import ConversationMessages from "@/app/components/ConversationMessages";
import ConversationHeader from "@/app/components/ConversationHeader";

interface Friend {
  nickname: string;
  profilePhoto: string;
  unreadMessages: boolean;
  updatedAt: string;
}

const conversation = () => {
  return (
    <View className="flex-1 bg-btc500">
      <ConversationHeader />
      <ConversationMessages />
    </View>
  );
};

export default conversation;
