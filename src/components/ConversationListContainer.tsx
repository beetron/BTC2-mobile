import { View, ScrollView, ActivityIndicator, Text, TouchableOpacity } from "react-native";
import { useCallback, useEffect, useMemo } from "react";
import { useRouter } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import useGetMyFriends from "../hooks/useGetMyFriends";
import useGetGroupConversations from "../hooks/useGetGroupConversations";
import ConversationListItem from "./ConversationListItem";
import GroupConversationListItem from "./GroupConversationListItem";
import { useFocusEffect } from "@react-navigation/native";
import { useAppStateListener } from "@/src/context/AppStateContext";
import conversationStore from "../zustand/conversationStore";
import useFcmToken from "../hooks/useFcmToken";
import useSetBadgeCount from "../hooks/useSetBadgeCount";
import useSocketListener from "../hooks/useSocketListener";
import { useTranslation } from "../hooks/useTranslation";

type ListRow =
  | { kind: "direct"; key: string; friend: any }
  | { kind: "group"; key: string; group: any };

const ConversationListContainer = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const { setMessages, setSelectedConversation } = conversationStore();
  const { myFriends, isLoading, getMyFriends } = useGetMyFriends();
  const { groupConversations, getGroupConversations } =
    useGetGroupConversations();
  const { manageFcmToken } = useFcmToken();
  const { setBadgeCountFromFriends } = useSetBadgeCount();

  // Run Effect when screen is back in focus. getMyFriends/getGroupConversations
  // aren't called here -- useGetMyFriends/useGetGroupConversations already
  // fetch on focus internally, so calling them again here would fire every
  // request twice.
  useFocusEffect(
    useCallback(() => {
      setMessages([]);
      setSelectedConversation(null);
    }, [])
  );

  // Handle FCM token registration or renewal
  useEffect(() => {
    manageFcmToken();
  }, [manageFcmToken]);

  useAppStateListener(() => {
    getMyFriends();
    getGroupConversations();
    manageFcmToken();
    console.log("App state changed, refreshing friend list and FCM token");
  });

  // Badge count is derived from myFriends (already has unreadCount per
  // friend) whenever it changes, instead of setBadgeCount making its own
  // redundant /users/friendlist call on top of the one useGetMyFriends
  // already just made.
  useEffect(() => {
    setBadgeCountFromFriends(myFriends);
  }, [myFriends, setBadgeCountFromFriends]);

  // Refresh unread counts / ordering on any conversation activity -- any of
  // these can change what /users/friendlist or /conversations reports.
  // Badge count isn't called here -- the useEffect above already reacts to
  // myFriends changing, whatever the trigger.
  const refreshList = useCallback(() => {
    getMyFriends();
    getGroupConversations();
  }, [getMyFriends, getGroupConversations]);

  useSocketListener("conversation:message", refreshList);
  useSocketListener("conversation:updated", refreshList);
  useSocketListener("conversation:memberAdded", refreshList);
  useSocketListener("conversation:memberRemoved", refreshList);
  useSocketListener("newMessageSignal", refreshList);

  // Merge friends + groups into one list, sorted the same way
  // GET /users/friendlist already sorts itself: unread count desc, then
  // most-recent-activity desc (see user.controller.js's getFriendList).
  const rows: ListRow[] = useMemo(() => {
    const friendRows: ListRow[] = myFriends.map((friend) => ({
      kind: "direct",
      key: friend._id,
      friend,
    }));
    const groupRows: ListRow[] = groupConversations.map((group) => ({
      kind: "group",
      key: group.conversationId,
      group,
    }));

    return [...friendRows, ...groupRows].sort((a, b) => {
      const aUnread = a.kind === "direct" ? a.friend.unreadCount : a.group.unreadCount;
      const bUnread = b.kind === "direct" ? b.friend.unreadCount : b.group.unreadCount;
      if (aUnread !== bUnread) return bUnread - aUnread;

      const aTime = a.kind === "direct" ? a.friend.updatedAt : a.group.lastMessageAt;
      const bTime = b.kind === "direct" ? b.friend.updatedAt : b.group.lastMessageAt;
      if (!aTime) return 1;
      if (!bTime) return -1;
      return new Date(bTime).getTime() - new Date(aTime).getTime();
    });
  }, [myFriends, groupConversations]);

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="white" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 p-4">
      <View className="w-full">
        <TouchableOpacity
          onPress={() => router.push("/members/createGroup")}
          className="flex-row items-center justify-center bg-btc400 rounded-xl py-3 mb-2"
        >
          <MaterialCommunityIcons name="account-group" size={22} color="#75E6DA" />
          <Text className="text-btc100 font-funnel-semi-bold text-lg ml-2">
            {t("home.newGroupButton")}
          </Text>
        </TouchableOpacity>

        {rows.length === 0 ? (
          <Text className="font-funnel-regular text-btc100 text-xl text-center mt-14">
            {t("home.emptyFriends")}
          </Text>
        ) : (
          rows.map((row) =>
            row.kind === "direct" ? (
              <ConversationListItem key={row.key} friend={row.friend} />
            ) : (
              <GroupConversationListItem key={row.key} group={row.group} />
            )
          )
        )}
      </View>
    </ScrollView>
  );
};

export default ConversationListContainer;
