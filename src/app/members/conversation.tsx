import {
  View,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
} from "react-native";
import React, { useEffect } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import ConversationMessages from "../../components/ConversationMessages";
import ConversationHeader from "../../components/ConversationHeader";
import ConversationInput from "../../components/ConversationInput";
import conversationStore from "../../zustand/conversationStore";
import useGetConversationDetail from "../../hooks/useGetConversationDetail";

const Conversation = () => {
  const { conversationId } = useLocalSearchParams<{
    conversationId: string;
  }>();
  const router = useRouter();
  const { selectedConversation } = conversationStore();
  const { getConversationDetail } = useGetConversationDetail();

  // Always resolve full detail from the conversationId route param, rather
  // than relying on whatever navigated here to have already seeded the
  // store -- one uniform code path regardless of origin (list tap, new-chat
  // tap, or a future notification deep link).
  useEffect(() => {
    if (!conversationId) {
      router.replace("/members");
      return;
    }
    if (selectedConversation?.conversationId !== conversationId) {
      getConversationDetail(conversationId).then((success) => {
        if (!success) router.replace("/members");
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  if (!selectedConversation || selectedConversation.conversationId !== conversationId) {
    return (
      <View className="flex-1 bg-btc500 justify-center items-center">
        <ActivityIndicator size="large" color="white" />
      </View>
    );
  }

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

export default Conversation;
