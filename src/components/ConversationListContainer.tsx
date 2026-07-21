import { View, ScrollView, ActivityIndicator, Text } from "react-native";
import { useCallback, useEffect } from "react";
import useGetMyFriends from "../hooks/useGetMyFriends";
import ConversationListItem from "./ConversationListItem";
import { useFocusEffect } from "@react-navigation/native";
import { useAppStateListener } from "@/src/context/AppStateContext";
import conversationStore from "../zustand/conversationStore";
import useFcmToken from "../hooks/useFcmToken";
import useSetBadgeCount from "../hooks/useSetBadgeCount";
import useSocketListener from "../hooks/useSocketListener";

const ConversationListContainer = () => {
  const { setMessages, setSelectedConversation } = conversationStore();
  const { myFriends, isLoading, getMyFriends } = useGetMyFriends();
  const { manageFcmToken } = useFcmToken();
  const { setBadgeCount } = useSetBadgeCount();

  // Run Effect when screen is back in focus
  useFocusEffect(
    useCallback(() => {
      setMessages([]);
      setSelectedConversation(null);
      getMyFriends();
      setBadgeCount();
    }, [getMyFriends, setBadgeCount])
  );

  // Handle FCM token registration or renewal
  useEffect(() => {
    manageFcmToken();
  }, [manageFcmToken]);

  useAppStateListener(() => {
    getMyFriends();
    setBadgeCount();
    manageFcmToken();
    console.log("App state changed, refreshing friend list and FCM token");
  });

  // Refresh unread counts / ordering on any conversation activity -- any of
  // these can change what /users/friendlist reports.
  const refreshList = useCallback(() => {
    getMyFriends();
    setBadgeCount();
  }, [getMyFriends, setBadgeCount]);

  useSocketListener("conversation:message", refreshList);
  useSocketListener("conversation:updated", refreshList);
  useSocketListener("conversation:memberAdded", refreshList);
  useSocketListener("conversation:memberRemoved", refreshList);
  useSocketListener("newMessageSignal", refreshList);

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="white" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 p-4">
      <View className="flex-1 w-full">
        {myFriends.length === 0 ? (
          <Text className="font-funnel-regular text-btc100 text-xl text-center mt-14">
            Add a friend to start chatting!
          </Text>
        ) : (
          myFriends.map((friend) => (
            <ConversationListItem key={friend._id} friend={friend} />
          ))
        )}
      </View>
    </ScrollView>
  );
};

export default ConversationListContainer;
