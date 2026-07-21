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
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

const ConversationMessages = () => {
  const { authState } = useAuth();
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
      {/* Subtle syncing indicator when fetching fresh messages but cache is displayed */}
      {isSyncing && messages.length > 0 && (
        <View className="flex-row items-center justify-center py-1 bg-btc400">
          <ActivityIndicator size="small" color="#75E6DA" />
          <Text className="font-funnel-regular text-btc100 text-xs ml-2">
            Syncing…
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
              You have no messages with{" "}
              {selectedConversation?.name ?? "your friend"}
            </Text>
          </View>
        }
        renderItem={({ item: message }) => {
          // "Mine vs. not-mine" rather than comparing against a single known
          // partner id -- the direct-chat case where the other sender is
          // always the same person is a special case of this, and this is
          // the shape a group thread (multiple possible senders) needs.
          const isMine = message.senderId === myUserId;

          return (
            <View>
              {!isMine ? (
                <View className="items-start mb-5 mr-auto max-w-[80%]">
                  <View className="flex-row bg-btc400 rounded-e-2xl pl-2 p-4">
                    {/* Phase 1 (direct chats only): the "other" avatar is
                        always the conversation partner's, already resolved
                        on selectedConversation. Phase 2 (group) will need
                        per-sender resolution across selectedConversation.members
                        instead. */}
                    {selectedConversation?.avatarData ? (
                      <Image
                        source={{ uri: selectedConversation.avatarData }}
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
