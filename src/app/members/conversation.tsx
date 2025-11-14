import { View, Platform, KeyboardAvoidingView } from "react-native";
import React from "react";
import ConversationMessages from "../../components/ConversationMessages";
import ConversationHeader from "../../components/ConversationHeader";
import ConversationInput from "../../components/ConversationInput";

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
