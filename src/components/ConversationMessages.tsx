import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { Image } from "expo-image";
import React, { useCallback, useRef, useState } from "react";
import { useAppStateListener } from "../context/AppStateContext";
import conversationStore from "../zustand/conversationStore";
import { useAuth } from "../context/AuthContext";
import useGetMessages from "../hooks/useGetMessages";
import useGetMessageImages from "../hooks/useGetMessageImages";
import useSocketListener from "../hooks/useSocketListener";
import formatDate from "../utils/formatDate";
import Autolink from "react-native-autolink";
import { images } from "../constants/images";
import useSetBadgeCount from "../hooks/useSetBadgeCount";
import MessageImageGallery from "./MessageImageGallery";
import LinkPreviewCard from "./LinkPreviewCard";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslation } from "../hooks/useTranslation";
import { extractFirstUrl } from "../utils/extractFirstUrl";

const ConversationMessages = () => {
  const { authState } = useAuth();
  const { t } = useTranslation();
  const { isLoading, isSyncing, isLoadingMore, hasMore, getMessages, loadMore } =
    useGetMessages();
  const { messages, selectedConversation } = conversationStore();
  const flatListRef = useRef<FlatList<any> | null>(null);
  const [showScrollToLatest, setShowScrollToLatest] = useState(false);
  const { getMessageImageSource } = useGetMessageImages();
  // Using getMyFriends-derived unread total to update BadgeCount (temporary solution)
  const { setBadgeCount } = useSetBadgeCount();
  const placeholderProfileImage = images.placeholderProfileImage;
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
        <Text className="font-funnel-regular text-btc100 text-2xl">
          {t("common.loading")}
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1">
      {/* Subtle syncing indicator when fetching fresh messages but cache is displayed */}
      {isSyncing && messages.length > 0 && (
        <View className="flex-row items-center justify-center py-1 bg-btc400">
          <ActivityIndicator size="small" color="#75E6DA" />
          <Text className="font-funnel-regular text-btc100 text-xs ml-2">
            {t("conversation.syncing")}
          </Text>
        </View>
      )}

      <FlatList
        className="flex-1"
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
              <ActivityIndicator size="small" color="#75E6DA" />
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View className="justify-center items-center mt-64">
            <Text className="font-funnel-regular text-btc100 text-2xl">
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

          return (
            <View>
              {!isMine ? (
                <View className="items-start mb-5 mr-auto max-w-[80%]">
                  {isGroup && (
                    <Text className="font-funnel-regular text-btc200 text-xs ml-2 mb-1">
                      {sender?.nickname || t("common.unknown")}
                    </Text>
                  )}
                  <View className="flex-row bg-btc400 rounded-e-2xl pl-2 p-4">
                    {otherAvatarData ? (
                      <Image
                        source={{ uri: otherAvatarData }}
                        style={{ width: 50, height: 50, borderRadius: 50 }}
                        className="bg-btc100"
                      />
                    ) : (
                      <Image
                        source={placeholderProfileImage}
                        style={{ width: 50, height: 50, borderRadius: 50 }}
                        className="bg-btc100"
                      />
                    )}
                    <View className="flex-1 pl-2">
                      <Autolink
                        text={message.message}
                        className="text-btc100 text-lg"
                        linkStyle={{ color: "#75E6DA" }}
                      />
                      {message.imageFiles && message.imageFiles.length > 0 && (
                        <MessageImageGallery
                          imageFilenames={message.imageFiles}
                          imageSources={message.imageFiles.map(
                            (filename: string) =>
                              getMessageImageSource(filename)
                          )}
                        />
                      )}
                      {firstUrl && <LinkPreviewCard url={firstUrl} />}
                    </View>
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
                      linkStyle={{ color: "#D4F1F4" }}
                    />
                    {message.imageFiles && message.imageFiles.length > 0 && (
                      <MessageImageGallery
                        imageFilenames={message.imageFiles}
                        imageSources={message.imageFiles.map(
                          (filename: string) =>
                            getMessageImageSource(filename)
                        )}
                      />
                    )}
                    {firstUrl && <LinkPreviewCard url={firstUrl} />}
                  </View>
                  <Text className="font-funnel-regular text-btc100 text-sm mr-2">
                    {formatDate(message.createdAt)}
                  </Text>
                </View>
              )}
            </View>
          );
        }}
      />

      {/* Floating scroll-to-latest button */}
      {messages.length > 0 && showScrollToLatest && (
        <View className="absolute right-4 bottom-24 z-50">
          <TouchableOpacity
            className="rounded-full bg-btc300 p-2 shadow-lg"
            onPress={() => {
              // Scroll to newest: with inverted FlatList, offset 0 is newest
              try {
                flatListRef.current?.scrollToOffset({
                  offset: 0,
                  animated: true,
                });
              } catch (err) {
                // fallback to scrollToIndex
                try {
                  flatListRef.current?.scrollToIndex({
                    index: 0,
                    animated: true,
                  });
                } catch (err2) {
                  console.warn("Scrolling to latest failed:", err2);
                }
              }
              setShowScrollToLatest(false);
            }}
          >
            <MaterialCommunityIcons
              name="arrow-down-circle"
              size={28}
              color="#D4F1F4"
            />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default ConversationMessages;
