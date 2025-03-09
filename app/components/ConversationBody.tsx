import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import React, { useCallback, useRef, useEffect } from "react";
import { useAppStateListener } from "../../context/AppStateContext";
import { useFocusEffect } from "@react-navigation/native";
import friendStore from "../../zustand/friendStore";
import useGetMessages from "../../hooks/useGetMessages";
import formatDate from "../../utils/formatDate";
import Ionicons from "@expo/vector-icons/Ionicons";

interface Message {
  nickname: string;
  senderId: string;
  message: string;
  createdAt: string;
}

const ConversationBody = () => {
  const { messages: messagesData, isLoading, getMessages } = useGetMessages();
  const { messages, selectedFriend } = friendStore();

  // Run Effect when screen is back in focus
  useFocusEffect(
    useCallback(() => {
      getMessages();
    }, [getMessages])
  );

  // Run when App State is active again
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

  const handleOnPress = () => {};

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
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
                    <Text className="text-btc100 text-lg">
                      {message.message}
                    </Text>
                  </View>
                  <Text className="font-funnel-regular text-btc100 text-sm ml-2">
                    {formatDate(message.createdAt)}
                  </Text>
                </View>
              ) : (
                <View className="items-end mb-5 ml-5">
                  <View className="flex bg-btc300 rounded-s-2xl pl-3 p-4">
                    <Text className="text-btc100 text-lg">
                      {message.message}
                    </Text>
                  </View>
                  <Text className="font-funnel-regular text-btc100 text-sm mr-2">
                    {formatDate(message.createdAt)}
                  </Text>
                </View>
              )}
            </View>
          )}
        />

        <View className="flex-1 max-h-24 justify-center border-t-hairline border-btc100 bg-[#1f1f2e]">
          <View className="flex-row justify-end items-center bottom-4 right-5">
            <TextInput
              placeholder="Start typing..."
              placeholderTextColor="black"
              className="h-10 w-3/4 px-4 mr-2 bg-btc100 rounded-2xl border-2 border-btc20"
            />
            <TouchableOpacity onPress={handleOnPress}>
              <Ionicons name="send-sharp" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default ConversationBody;
