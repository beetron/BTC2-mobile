import { Alert } from "react-native";
import React, { useState } from "react";
import { useRouter } from "expo-router";
import axiosClient from "../utils/axiosClient";
import ChatRow from "./ChatRow";
import Avatar from "./Avatar";
import { useLocale } from "../context/LocaleContext";
import { formatConversationTimestamp } from "../utils/formatConversationTimestamp";

interface FriendProps {
  _id: string;
  nickname: string;
  profileImage: string;
  profileImageData?: string;
  unreadCount: number;
  updatedAt: string;
}

// Every friend is shown here regardless of whether a conversation with them
// exists yet -- tapping lazily finds-or-creates the direct conversation
// (POST /conversations/direct is idempotent) before navigating, so there's
// no separate "start a new chat" step for the common case.
const ConversationListItem = ({ friend }: { friend: FriendProps }) => {
  const [isOpening, setIsOpening] = useState(false);
  const router = useRouter();
  const { locale } = useLocale();
  const timestamp = formatConversationTimestamp(friend.updatedAt, locale);

  const handleOnPress = async () => {
    if (isOpening) return;
    try {
      setIsOpening(true);
      const res = await axiosClient.post("/conversations/direct", {
        userId: friend._id,
      });
      router.push(
        `/members/conversation?conversationId=${res.data.conversationId}`
      );
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.response?.data?.error || "Failed to open chat"
      );
    } finally {
      setIsOpening(false);
    }
  };

  return (
    <ChatRow
      avatar={<Avatar uri={friend.profileImageData} size={50} />}
      name={friend.nickname}
      timestamp={timestamp}
      unreadCount={friend.unreadCount || 0}
      isBusy={isOpening}
      onPress={handleOnPress}
    />
  );
};

export default ConversationListItem;
