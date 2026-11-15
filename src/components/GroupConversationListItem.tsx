import React from "react";
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

  return (
    <ChatRow
      avatar={<Avatar group size={50} />}
      name={group.name || t("home.groupFallbackName")}
      subtitle={t("home.memberCount", { count: group.memberCount })}
      timestamp={timestamp}
      unreadCount={group.unreadCount || 0}
      onPress={() =>
        router.push(`/members/conversation?conversationId=${group.conversationId}`)
      }
    />
  );
};

export default GroupConversationListItem;
