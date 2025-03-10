import { View, Platform, KeyboardAvoidingView } from "react-native";
import React from "react";
import ConversationMessages from "@/app/components/ConversationMessages";
import ConversationHeader from "@/app/components/ConversationHeader";
import ConversationInput from "@/app/components/ConversationInput";

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
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ConversationMessages />
        <ConversationInput />
      </KeyboardAvoidingView>
    </View>
  );
};

export default conversation;
