import React, { useRef } from "react";
import { useRouter } from "expo-router";
import ChatRow from "./ChatRow";
import Avatar from "./Avatar";
import { GroupConversationSummary } from "../hooks/useGetGroupConversations";
import { useTranslation } from "../hooks/useTranslation";
import { useLocale } from "../context/LocaleContext";
import { formatConversationTimestamp } from "../utils/formatConversationTimestamp";

// Groups have no avatar image (skipped for v1) and no lazy find-or-create
// step since the conversation already exists.
const GroupConversationListItem = ({
  group,
}: {
  group: GroupConversationSummary;
}) => {
  const router = useRouter();
  const { t } = useTranslation();
  const { locale } = useLocale();
  const timestamp = formatConversationTimestamp(group.lastMessageAt, locale);
  // A quick double tap pushed the chat twice, leaving a duplicate screen
  // to back out of. Direct rows already guard this while they open.
  const lastPress = useRef(0);
  const open = () => {
    const now = Date.now();
    if (now - lastPress.current < 1000) return;
    lastPress.current = now;
    router.push(`/members/conversation?conversationId=${group.conversationId}`);
  };

  return (
    <ChatRow
      avatar={<Avatar group size={50} />}
      name={group.name || t("home.groupFallbackName")}
      subtitle={t("home.memberCount", { count: group.memberCount })}
      timestamp={timestamp}
      unreadCount={group.unreadCount || 0}
      onPress={open}
    />
  );
};

export default GroupConversationListItem;
