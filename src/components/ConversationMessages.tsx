import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
} from "react-native";
import React, { useCallback, useRef, useState } from "react";
import { useAppStateListener } from "../context/AppStateContext";
import conversationStore from "../zustand/conversationStore";
import { useAuth } from "../context/AuthContext";
import useGetMessages from "../hooks/useGetMessages";
import useGetMessageImages from "../hooks/useGetMessageImages";
import useSocketListener from "../hooks/useSocketListener";
import formatDate from "../utils/formatDate";
import Autolink from "react-native-autolink";
import Avatar from "./Avatar";
import IconCircleButton from "./IconCircleButton";
import { useThemeColors } from "../context/ThemeContext";
import { useTypeScale } from "../hooks/useTypeScale";
import { senderColorFor } from "../constants/theme";
import useSetBadgeCount from "../hooks/useSetBadgeCount";
import MessageImageGallery from "./MessageImageGallery";
import LinkPreviewCard from "./LinkPreviewCard";
import { useTranslation } from "../hooks/useTranslation";
import { extractFirstUrl } from "../utils/extractFirstUrl";

const ConversationMessages = () => {
  const { authState } = useAuth();
  const { t } = useTranslation();
  const colors = useThemeColors();
  const ts = useTypeScale();
  const { isLoading, isSyncing, isLoadingMore, hasMore, getMessages, loadMore } =
    useGetMessages();
  const { messages, selectedConversation } = conversationStore();
  const flatListRef = useRef<FlatList<any> | null>(null);
  const [showScrollToLatest, setShowScrollToLatest] = useState(false);
  // Bumped to force-remount the FlatList when jumping to the latest message.
  // scrollToOffset/scrollToIndex on an inverted FlatList have proven
  // unreliable here (both silently no-op on long histories) -- a remount
  // sidesteps the native scrollTo path entirely, since a freshly mounted
  // inverted list always starts at offset 0 (the newest message).
  const [listResetKey, setListResetKey] = useState(0);
  const { getMessageImageSource } = useGetMessageImages();
  // Using getMyFriends-derived unread total to update BadgeCount (temporary solution)
  const { setBadgeCount } = useSetBadgeCount();
  const myUserId = authState?.user?._id;

  // Refresh when a new message arrives for THIS conversation specifically.
  const onConversationMessage = useCallback(
    (payload: { conversationId?: string }) => {
      if (payload?.conversationId === selectedConversation?.conversationId) {
        getMessages();
        setBadgeCount();
      }
    },
    [selectedConversation?.conversationId, getMessages, setBadgeCount]
  );
  useSocketListener("conversation:message", onConversationMessage);

  // Rollout-safety fallback for peers still sending via legacy /messages/*
  const onLegacySignal = useCallback(() => {
    getMessages();
    setBadgeCount();
  }, [getMessages, setBadgeCount]);
  useSocketListener("newMessageSignal", onLegacySignal);

  // Refresh messages when app becomes active
  useAppStateListener(() => {
    getMessages();
    setBadgeCount();
  });

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
          // partner id -- the direct-chat case where the other sender is
          // always the same person is a special case of this, and this is
          // the shape a group thread (multiple possible senders) needs.
          const isMine = message.senderId === myUserId;

          // Direct chats: the "other" avatar is always the conversation
          // partner's, already resolved on selectedConversation. Group
          // chats: resolve per-sender since there are multiple possible
          // "other" senders.
          const isGroup = selectedConversation?.type === "group";
          const sender = isGroup
            ? selectedConversation?.members.find(
                (m) => m.userId === message.senderId
              )
            : null;
          const otherAvatarData = isGroup
            ? sender?.profileImageData
            : selectedConversation?.avatarData;

          const firstUrl = extractFirstUrl(message.message);

          const attachments = (
            <>
              {message.imageFiles && message.imageFiles.length > 0 && (
                <MessageImageGallery
                  imageFilenames={message.imageFiles}
                  imageSources={message.imageFiles.map((filename: string) =>
                    getMessageImageSource(filename)
                  )}
                />
              )}
              {firstUrl && <LinkPreviewCard url={firstUrl} />}
            </>
          );

          if (isMine) {
            return (
              <View className="items-end mb-3 ml-auto" style={{ maxWidth: "80%" }}>
                <View
                  className="px-3.5 py-2.5"
                  style={{
                    backgroundColor: colors.primary,
                    borderTopLeftRadius: 20,
                    borderTopRightRadius: 20,
                    borderBottomLeftRadius: 20,
                    borderBottomRightRadius: 6,
                  }}
                >
                  {message.message ? (
                    <Autolink
                      text={message.message}
                      className={ts.body}
                      style={{ color: colors.onPrimary, fontSize: 16 }}
                      linkStyle={{ color: colors.onPrimary, textDecorationLine: "underline" }}
                    />
                  ) : null}
                  {attachments}
                </View>
                <Text className={`${ts.caption} text-inkMuted mt-1 mr-1.5`}>
                  {formatDate(message.createdAt)}
                </Text>
              </View>
            );
          }

          return (
            <View className="flex-row items-end mb-3 mr-auto gap-2" style={{ maxWidth: "84%" }}>
              {isGroup && <Avatar uri={otherAvatarData} size={28} />}
              <View className="flex-shrink items-start">
                {isGroup && (
                  <Text
                    className={`${ts.label} ml-2.5 mb-1`}
                    style={{ color: senderColorFor(colors, message.senderId) }}
                    numberOfLines={1}
                  >
                    {sender?.nickname || t("common.unknown")}
                  </Text>
                )}
                <View
                  className="px-3.5 py-2.5"
                  style={{
                    backgroundColor: colors.bubbleOther,
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderTopLeftRadius: 20,
                    borderTopRightRadius: 20,
                    borderBottomRightRadius: 20,
                    borderBottomLeftRadius: 6,
                  }}
                >
                  {message.message ? (
                    <Autolink
                      text={message.message}
                      className={ts.body}
                      style={{ color: colors.ink, fontSize: 16 }}
                      linkStyle={{ color: colors.primary, textDecorationLine: "underline" }}
                    />
                  ) : null}
                  {attachments}
                </View>
                <Text className={`${ts.caption} text-inkMuted mt-1 ml-1.5`}>
                  {formatDate(message.createdAt)}
                </Text>
              </View>
            </View>
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
    </View>
  );
};

export default ConversationMessages;
