import { View, Text } from "react-native";
import React from "react";
import ConversationContainer from "@/app/components/ConversationContainer";
import HeaderConversation from "@/app/components/HeaderConversation";

interface Friend {
  nickname: string;
  profilePhoto: string;
  unreadMessages: boolean;
  updatedAt: string;
}

const conversation = () => {
  return (
    <View className="flex-1 bg-btc500">
      <HeaderConversation />
      <ConversationContainer />
    </View>
  );
};

export default conversation;
