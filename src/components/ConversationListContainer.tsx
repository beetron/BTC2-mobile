import { View, ScrollView, ActivityIndicator, Text, TextInput } from "react-native";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import ScreenHeader from "./ScreenHeader";
import IconCircleButton from "./IconCircleButton";
import Chip from "./Chip";
import { images } from "../constants/images";
import { useThemeColors } from "../context/ThemeContext";
import { useTypeScale } from "../hooks/useTypeScale";
import useGetMyFriends from "../hooks/useGetMyFriends";
import useGetGroupConversations from "../hooks/useGetGroupConversations";
import ConversationListItem from "./ConversationListItem";
import GroupConversationListItem from "./GroupConversationListItem";
import { useFocusEffect, useIsFocused } from "@react-navigation/native";
import { useAppStateListener } from "@/src/context/AppStateContext";
import conversationStore from "../zustand/conversationStore";
import unreadStore from "../zustand/unreadStore";
import useFcmToken from "../hooks/useFcmToken";
import { applyBadgeCount } from "../hooks/useSetBadgeCount";
import useSocketListener from "../hooks/useSocketListener";
import { useTranslation } from "../hooks/useTranslation";

type ListRow =
  | { kind: "direct"; key: string; friend: any }
  | { kind: "group"; key: string; group: any };

type ListFilter = "all" | "unread" | "direct" | "groups";

const rowUnread = (row: ListRow): number =>
  (row.kind === "direct" ? row.friend.unreadCount : row.group.unreadCount) || 0;

const ConversationListContainer = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const colors = useThemeColors();
  const ts = useTypeScale();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<ListFilter>("all");
  const { setMessages, setSelectedConversation } = conversationStore();
  const { myFriends, isInitialLoad, hasLoaded: friendsLoaded, getMyFriends } =
    useGetMyFriends();
  const { groupConversations, hasLoaded: groupsLoaded, getGroupConversations } =
    useGetGroupConversations();
  const { manageFcmToken } = useFcmToken();
  const { setTotalUnreadCount } = unreadStore();
  const readSignal = unreadStore((s) => s.readSignal);
  const isFocused = useIsFocused();

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

  // Home tab badge -- direct-chat unread (myFriends) plus group-chat unread
  // (groupConversations), recomputed whenever either list changes so it
  // stays live across socket-driven refreshes and focus refetches.
  useEffect(() => {
    const friendsUnread = myFriends.reduce(
      (sum, friend) => sum + (friend.unreadCount || 0),
      0
    );
    const groupsUnread = groupConversations.reduce(
      (sum, group) => sum + (group.unreadCount || 0),
      0
    );
    setTotalUnreadCount(friendsUnread + groupsUnread);
    // App icon too, with no extra request -- but only once both lists have
    // loaded: on launch they start empty, and setting 0 then wiped the
    // count the last push put there
    if (friendsLoaded && groupsLoaded) applyBadgeCount(friendsUnread + groupsUnread);
  }, [myFriends, groupConversations, friendsLoaded, groupsLoaded, setTotalUnreadCount]);

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

  // A chat was just marked read on the server. Leaving a chat sends that
  // mark at the same moment this screen refetches on focus, so the focus
  // fetch can still see the old count: fetch again once the mark is done.
  // While a chat is open this screen isn't focused and its focus fetch
  // covers it later, so marks made then don't cost a refetch.
  useEffect(() => {
    if (readSignal > 0 && isFocused) refreshList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readSignal]);

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

  // Search + filter chips are purely client-side over the rows already
  // fetched -- no extra requests, and the server-side sort order is kept.
  const unreadRowCount = useMemo(
    () => rows.filter((row) => rowUnread(row) > 0).length,
    [rows]
  );

  const visibleRows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return rows.filter((row) => {
      if (filter === "unread" && rowUnread(row) === 0) return false;
      if (filter === "direct" && row.kind !== "direct") return false;
      if (filter === "groups" && row.kind !== "group") return false;
      if (!needle) return true;
      const name =
        row.kind === "direct"
          ? row.friend.nickname
          : row.group.name || t("home.groupFallbackName");
      return (name || "").toLowerCase().includes(needle);
    });
  }, [rows, filter, query, t]);

  const filters: { value: ListFilter; label: string }[] = [
    { value: "all", label: t("home.filter.all") },
    {
      value: "unread",
      label:
        unreadRowCount > 0
          ? `${t("home.filter.unread")} · ${unreadRowCount}`
          : t("home.filter.unread"),
    },
    { value: "direct", label: t("home.filter.direct") },
    { value: "groups", label: t("home.filter.groups") },
  ];

  const header = (
    <View>
      <ScreenHeader
        title={t("tabs.chats")}
        leading={
          <Image
            source={images.appMark}
            style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: "#FFFFFF" }}
            contentFit="contain"
            accessibilityIgnoresInvertColors
          />
        }
        actions={
          <IconCircleButton
            icon="plus"
            variant="primary"
            accessibilityLabel={t("home.newGroupButton")}
            onPress={() => router.push("/members/createGroup")}
          />
        }
      />
      <View className="px-5 gap-3 pb-3">
        <View
          className="flex-row items-center rounded-full bg-surface border border-border px-4 gap-2.5"
          style={{ minHeight: 44 }}
        >
          <MaterialCommunityIcons name="magnify" size={20} color={colors.inkMuted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={t("home.searchPlaceholder")}
            placeholderTextColor={colors.inkMuted}
            accessibilityLabel={t("home.searchPlaceholder")}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            clearButtonMode="while-editing"
            className={`flex-1 ${ts.body}`}
            style={{ color: colors.ink, paddingVertical: 10, fontSize: 16 }}
          />
        </View>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 8, paddingBottom: 12 }}
        keyboardShouldPersistTaps="handled"
      >
        {filters.map((f) => (
          <Chip
            key={f.value}
            label={f.label}
            selected={filter === f.value}
            onPress={() => setFilter(f.value)}
          />
        ))}
      </ScrollView>
    </View>
  );

  // Only on the very first load -- a refresh keeps the current rows on screen
  // and swaps them out when it resolves. Row keys are stable (friend._id /
  // conversationId) so React updates in place rather than remounting, and
  // scroll position survives. Same stale-while-revalidate shape as
  // ConversationMessages.tsx's `isLoading && messages.length === 0`.
  if (isInitialLoad) {
    return (
      <View className="flex-1">
        {header}
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  const emptyMessage =
    rows.length === 0 ? t("home.emptyFriends") : t("home.noResults");

  return (
    <View className="flex-1">
      {header}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 14, paddingTop: 4, paddingBottom: 24 }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        {visibleRows.length === 0 ? (
          <Text className={`${ts.body} text-inkMuted text-center mt-14 mx-6`}>
            {emptyMessage}
          </Text>
        ) : (
          // Capsules float on the page with a gap between each -- no shared
          // container card.
          <View style={{ gap: 10 }}>
            {visibleRows.map((row) =>
              row.kind === "direct" ? (
                <ConversationListItem key={row.key} friend={row.friend} />
              ) : (
                <GroupConversationListItem key={row.key} group={row.group} />
              )
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default ConversationListContainer;
