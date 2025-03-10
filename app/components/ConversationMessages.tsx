import { View, Text, FlatList } from "react-native";
import React, { useCallback } from "react";
import { useAppStateListener } from "../../context/AppStateContext";
import { useFocusEffect } from "@react-navigation/native";
import friendStore from "../../zustand/friendStore";
import useGetMessages from "../../hooks/useGetMessages";
import formatDate from "../../utils/formatDate";

interface Message {
  nickname: string;
  senderId: string;
  message: string;
  createdAt: string;
}

const ConversationMessages = () => {
  const { isLoading, getMessages } = useGetMessages();
  const { messages, selectedFriend } = friendStore();

  // Fetch messages when screen is back in focus
  useFocusEffect(
    useCallback(() => {
      getMessages();
    }, [getMessages])
  );

  // Refresh messages when app becomes active
  useAppStateListener(() => {
    getMessages();
  });

  if (isLoading) {
    return (
      <View className="justify-center items-center mt-14">
        <Text className="font-funnel-regular text-btc100 text-2xl">
          Loading...
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <FlatList
        className="flex-1"
        data={messages.slice().reverse()}
        inverted={true}
        keyExtractor={(item, index) => index.toString()}
        ListEmptyComponent={
          <View className="justify-center items-center mt-64">
            <Text className="font-funnel-regular text-btc100 text-2xl">
              You have no messages with{" "}
              {selectedFriend?.nickname ?? "your friend"}
            </Text>
          </View>
        }
        renderItem={({ item: message }) => (
          <View>
            {message.senderId === selectedFriend?._id ? (
              <View className="items-start mb-5 mr-5">
                <View className="flex bg-btc400 rounded-e-2xl pl-3 p-4">
                  <Text className="text-btc100 text-lg">{message.message}</Text>
                </View>
                <Text className="font-funnel-regular text-btc100 text-sm ml-2">
                  {formatDate(message.createdAt)}
                </Text>
              </View>
            ) : (
              <View className="items-end mb-5 ml-5">
                <View className="flex bg-btc300 rounded-s-2xl pl-3 p-4">
                  <Text className="text-btc100 text-lg">{message.message}</Text>
                </View>
                <Text className="font-funnel-regular text-btc100 text-sm mr-2">
                  {formatDate(message.createdAt)}
                </Text>
              </View>
            )}
          </View>
        )}
      />
    </View>
  );
};

export default ConversationMessages;
