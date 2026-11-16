import { Alert } from "react-native";
import React, { useState } from "react";
import { useRouter } from "expo-router";
import axiosClient from "../utils/axiosClient";
import ChatRow from "./ChatRow";
import Avatar from "./Avatar";
import { useLocale } from "../context/LocaleContext";
import { formatConversationTimestamp } from "../utils/formatConversationTimestamp";
import { useTranslation } from "../hooks/useTranslation";
import { serverErrorMessage } from "../utils/serverError";

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
  const { t } = useTranslation();
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
      if (error.networkError === "NO_INTERNET") {
        Alert.alert(t("errors.noInternetTitle"), t("errors.noInternetOpenChat"));
      } else if (error.networkError === "TIMEOUT") {
        Alert.alert(t("errors.connectionTimeoutTitle"), t("errors.connectionTimeoutMessage"));
      } else {
        Alert.alert(t("common.error"), serverErrorMessage(error, t, "home.openChatFailed"));
      }
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
