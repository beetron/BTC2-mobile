import { View, Text } from "react-native";
import React, { useCallback, useEffect } from "react";
import { useAppStateListener } from "../../context/AppStateContext";
import { useFocusEffect } from "@react-navigation/native";
import friendStore from "../../zustand/friendStore";
import useGetMessages from "../../hooks/useGetMessages";

const ConversationMessages = () => {
  const { messages: messagesData, isLoading, getMessages } = useGetMessages();

  const {
    selectedFriend,
    messages,
    setMessages,
    shouldRender,
    setShouldRender,
  } = friendStore();

  // Run Effect when screen is back in focususe
  useFocusEffect(
    useCallback(() => {
      getMessages();
    }, [getMessages])
  );

  // Run when App State is active again
  useAppStateListener(getMessages);

  return (
    <View>
      <Text>ConversationContainer</Text>
    </View>
  );
};

export default ConversationMessages;
