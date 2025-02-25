import { View, Text, ScrollView } from "react-native";
import React, { useCallback, useEffect } from "react";
import { useAppStateListener } from "../../context/AppStateContext";
import { useFocusEffect } from "@react-navigation/native";
import friendStore from "../../zustand/friendStore";
import useGetMessages from "../../hooks/useGetMessages";

interface Message {
  nickname: string;
  senderId: string;
  message: string;
  createdAt: string;
}

const ConversationMessages = () => {
  const { messages: messagesData, isLoading, getMessages } = useGetMessages();

  const { messages } = friendStore();

  // Run Effect when screen is back in focususe
  useFocusEffect(
    useCallback(() => {
      getMessages();
    }, [getMessages])
  );

  // Run when App State is active again
  useAppStateListener(getMessages);

  // setMessages([...messages, ...messagesData]);
  console.log(messages);

  return (
    <ScrollView className="flex-1">
      <View className="flex-1 m-2">
        {messages.map((message: Message, index: number) => (
          <View key={index}>
            <Text className="font-funnel-regular text-btc100">
              Sender ID: {message.nickname}
            </Text>
            <Text className="font-funnel-regular text-btc100">
              Message: {message.message}
            </Text>
            <Text className="font-funnel-regular text-btc100">
              Sent: {message.createdAt}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

export default ConversationMessages;
