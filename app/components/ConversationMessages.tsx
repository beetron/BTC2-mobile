import { View, Text, FlatList } from "react-native";
import { Image } from "expo-image";
import React, { useCallback } from "react";
import { Redirect } from "expo-router";
import { useAppStateListener } from "../../context/AppStateContext";
import { useFocusEffect } from "@react-navigation/native";
import friendStore from "../../zustand/friendStore";
import useGetMessages from "../../hooks/useGetMessages";
import formatDate from "../../utils/formatDate";
import { useAuth } from "../../context/AuthContext";
import Autolink from "react-native-autolink"

const ConversationMessages = () => {
  const { authState } = useAuth();

  if (authState?.authenticated !== true) {
    return <Redirect href="/guests/Login" />;
  }

  const { isLoading, getMessages } = useGetMessages();
  const { messages, selectedFriend, shouldRender } = friendStore();

  // Fetch messages when screen is back in focus
  useFocusEffect(
    useCallback(() => {
      getMessages();
      console.log("useFocusEffect ran");
    }, [getMessages, shouldRender])
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
              <View className="items-start mb-5 mr-auto max-w-[80%]">
                <View className="flex-row bg-btc400 rounded-e-2xl pl-2 p-4">
                  <Image
                    source={selectedFriend?.profileImageData}
                    style={{ width: 50, height: 50, borderRadius: 50 }}
                  />
                  <Autolink 
                  text={message.message} 
                  className="text-btc100 text-lg pl-2"
                  linkStyle={{color: "#75E6DA"}}
                  />
                </View>
                <Text className="font-funnel-regular text-btc100 text-sm ml-2">
                  {formatDate(message.createdAt)}
                </Text>
              </View>
            ) : (
              <View className="item-end mb-5 ml-auto max-w-[80%]">
                <View className="flex bg-btc300 rounded-s-2xl pl-3 p-4">
                <Autolink 
                  text={message.message} 
                  className="text-btc400 text-lg"
                  linkStyle={{color: "#D4F1F4"}}
                  />
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
