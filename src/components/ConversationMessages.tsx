import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
} from "react-native";
import React, { useCallback, useRef, useState } from "react";
import { useAppStateListener } from "../context/AppStateContext";
import conversationStore, { Message } from "../zustand/conversationStore";
import { useAuth } from "../context/AuthContext";
import useGetMessages from "../hooks/useGetMessages";
import useSocketListener from "../hooks/useSocketListener";
import IconCircleButton from "./IconCircleButton";
import { useThemeColors } from "../context/ThemeContext";
import { useTypeScale } from "../hooks/useTypeScale";
import useSetBadgeCount from "../hooks/useSetBadgeCount";
import { useTranslation } from "../hooks/useTranslation";
import MessageBubble from "./MessageBubble";
import MessageActionSheet from "./MessageActionSheet";
import useMessageActionHandlers, { haptic } from "../hooks/useMessageActionHandlers";

const ConversationMessages = () => {
  const { authState } = useAuth();
  const { t } = useTranslation();
  const colors = useThemeColors();
  const ts = useTypeScale();
  const {
    isLoading,
    isSyncing,
    isLoadingMore,
    hasMore,
    getMessages,
    syncChanges,
    loadMore,
  } = useGetMessages();
  const { messages, selectedConversation } = conversationStore();
  const flatListRef = useRef<FlatList<any> | null>(null);
  const [showScrollToLatest, setShowScrollToLatest] = useState(false);
  // Bumped to force-remount the FlatList when jumping to the latest message.
  // scrollToOffset/scrollToIndex on an inverted FlatList have proven
  // unreliable here (both silently no-op on long histories) -- a remount
  // sidesteps the native scrollTo path entirely, since a freshly mounted
  // inverted list always starts at offset 0 (the newest message).
  const [listResetKey, setListResetKey] = useState(0);
  // The message whose action sheet is open
  const [actionMessage, setActionMessage] = useState<Message | null>(null);
  const { available, perform, labelFor } = useMessageActionHandlers();
  // Using getMyFriends-derived unread total to update BadgeCount (temporary solution)
  const { setBadgeCount } = useSetBadgeCount();
  const myUserId = authState?.user?._id;

  // A message in THIS conversation was created, edited or deleted. The
  // payload only carries ids, so pull just the changed messages from the
  // changes feed. No `action` means a bulk change (an admin deleting a
  // user's messages): refetch the thread instead.
  const onConversationMessage = useCallback(
    (payload: { conversationId?: string; action?: string }) => {
      if (payload?.conversationId === selectedConversation?.conversationId) {
        if (payload.action) syncChanges();
        else getMessages();
        setBadgeCount();
      }
    },
    [selectedConversation?.conversationId, getMessages, syncChanges, setBadgeCount]
  );
  useSocketListener("conversation:message", onConversationMessage);

  // Edits and deletes made while the socket was down never reach us as
  // events, so catch up once it reconnects
  const onConnectionChange = useCallback(
    (connected: boolean) => {
      if (connected) syncChanges();
    },
    [syncChanges]
  );
  useSocketListener("connectionChange", onConnectionChange);

  // Rollout-safety fallback for peers still sending via legacy /messages/*
  const onLegacySignal = useCallback(() => {
    getMessages();
    setBadgeCount();
  }, [getMessages, setBadgeCount]);
  useSocketListener("newMessageSignal", onLegacySignal);

  // Catch up when the app becomes active
  const onAppActive = useCallback(() => {
    syncChanges();
    setBadgeCount();
  }, [syncChanges, setBadgeCount]);
  useAppStateListener(onAppActive);

  const openActions = useCallback((message: Message) => {
    haptic("light");
    setActionMessage(message);
  }, []);

  if (isLoading && messages.length === 0) {
    // flex-1 here matters: without it this placeholder is only as tall as
    // its own content, so ConversationInput (its sibling below, inside the
    // same flex column) isn't pushed to the bottom during this first
    // frame -- it briefly renders near the top, then jumps down once the
    // real (flex-1) FlatList swaps in below.
    return (
      <View className="flex-1 justify-center items-center mt-14">
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View className="flex-1">
      {/* Subtle syncing indicator when fetching fresh messages but cache is displayed */}
      {isSyncing && messages.length > 0 && (
        <View className="flex-row items-center justify-center py-1.5 bg-primarySoft">
          <ActivityIndicator size="small" color={colors.primary} />
          <Text className={`${ts.caption} text-ink ml-2`}>
            {t("conversation.syncing")}
          </Text>
        </View>
      )}

      <FlatList
        key={listResetKey}
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 14, paddingVertical: 12 }}
        ref={flatListRef}
        data={messages}
        inverted={true}
        // show scroll-to-latest button when user scrolls up away from the newest message
        onScroll={({ nativeEvent }) => {
          const { contentOffset } = nativeEvent;
          // When inverted, offset near 0 indicates we're at / near the newest message
          const atBottom = contentOffset.y <= 40; // small threshold
          setShowScrollToLatest(!atBottom);
        }}
        scrollEventThrottle={16}
        keyExtractor={(item, index) => item._id || index.toString()}
        // Inverted list -- "end" here is the oldest-loaded message, i.e.
        // where the next older page should be fetched from.
        onEndReached={() => {
          if (hasMore && !isLoadingMore) loadMore();
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isLoadingMore ? (
            <View className="py-4 items-center">
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View className="justify-center items-center mt-64 mx-8">
            <Text className={`${ts.body} text-inkMuted text-center`}>
              {t("conversation.noMessagesWith", {
                name: selectedConversation?.name ?? t("conversation.yourFriendFallback"),
              })}
            </Text>
          </View>
        }
        renderItem={({ item: message }) => {
          // "Mine vs. not-mine" rather than comparing against a single known
          // partner id -- the direct-chat case is a special case of this.
          const isMine = message.senderId === myUserId;
          const isGroup = selectedConversation?.type === "group";
          // Direct chats: the "other" avatar is always the partner's.
          // Group chats: resolved per sender.
          const sender = isGroup
            ? selectedConversation?.members.find((m) => m.userId === message.senderId)
            : null;
          return (
            <MessageBubble
              message={message}
              isMine={isMine}
              isGroup={isGroup}
              sender={sender}
              otherAvatarData={isGroup ? sender?.profileImageData : selectedConversation?.avatarData}
              actions={available(message)}
              actionLabel={labelFor}
              onOpenActions={openActions}
              onAction={perform}
            />
          );
        }}
      />

      {/* Floating scroll-to-latest button */}
      {messages.length > 0 && showScrollToLatest && (
        <View className="absolute right-4 bottom-4 z-50" style={{ elevation: 4 }}>
          <IconCircleButton
            icon="arrow-down"
            accessibilityLabel={t("conversation.scrollToLatest")}
            onPress={() => {
              setShowScrollToLatest(false);
              // Remount instead of scrollToOffset/scrollToIndex -- both are
              // unreliable on this inverted FlatList (see note above). A
              // fresh mount always renders starting at the newest message.
              setListResetKey((k) => k + 1);
            }}
          />
        </View>
      )}

      <MessageActionSheet message={actionMessage} onClose={() => setActionMessage(null)} />
    </View>
  );
};

export default ConversationMessages;
