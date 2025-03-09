import { View, Platform, StyleSheet } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import React from "react";
import ConversationBody from "@/app/components/ConversationBody";
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
    //<KeyboardAwareScrollView>
    <View className="flex-1 bg-btc500">
      <ConversationHeader />
      <ConversationBody />
      {/* <ConversationInput /> */}
    </View>
    //</KeyboardAwareScrollView>
  );
};

export default conversation;
