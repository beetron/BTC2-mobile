import { View, Text } from "react-native";
import React, { useEffect } from "react";
import friendStore from "../../zustand/friendStore";
import useGetMessages from "../../hooks/useGetMessages";

const ConversationMessages = () => {
  const { messages: messagesData, isLoading } = useGetMessages();

  const {
    selectedFriend,
    messages,
    setMessages,
    shouldRender,
    setShouldRender,
  } = friendStore();

  console.log(messages);
  // useEffect(() => {
  //   getMessages();
  //   console.log(messages);
  // }, [shouldRender]);

  return (
    <View>
      <Text>ConversationContainer</Text>
    </View>
  );
};

export default ConversationMessages;
