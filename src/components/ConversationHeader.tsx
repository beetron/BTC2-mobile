import { useRouter } from "expo-router";
import StackHeader from "./StackHeader";
import Avatar from "./Avatar";
import conversationStore from "../zustand/conversationStore";
import ConversationActionMenu from "./ConversationActionMenu";
import { useTranslation } from "../hooks/useTranslation";

const ConversationHeader = () => {
  const { selectedConversation } = conversationStore();
  const { t } = useTranslation();
  const router = useRouter();
  const isGroup = selectedConversation?.type === "group";
  const title =
    selectedConversation?.name ||
    (isGroup
      ? t("conversation.groupFallbackTitle")
      : t("conversation.chatFallbackTitle"));

  return (
    <StackHeader
      backTo="home"
      title={title}
      subtitle={
        isGroup && selectedConversation
          ? t("conversation.memberCountSubtitle", {
              count: selectedConversation.members.length,
            })
          : undefined
      }
      leading={
        isGroup ? (
          <Avatar group size={40} />
        ) : (
          <Avatar uri={selectedConversation?.avatarData} size={40} />
        )
      }
      onPressTitle={isGroup ? () => router.push("/members/groupSettings") : undefined}
      right={<ConversationActionMenu />}
    />
  );
};

export default ConversationHeader;
