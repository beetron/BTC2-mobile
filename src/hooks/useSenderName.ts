import { useCallback } from "react";
import conversationStore from "../zustand/conversationStore";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "./useTranslation";

// Display name for a message sender in the open conversation: "You" for
// your own messages, the partner's name in a direct chat, the member's
// nickname in a group. Used by quotes, the "Replying to" bar and the
// message action preview.
const useSenderName = () => {
  const { authState } = useAuth();
  const { t } = useTranslation();
  const selectedConversation = conversationStore((s) => s.selectedConversation);
  const myUserId = authState?.user?._id;

  return useCallback(
    (senderId: string | null | undefined): string => {
      if (senderId && senderId === myUserId) return t("conversation.you");
      if (selectedConversation?.type === "group") {
        const member = selectedConversation.members.find((m) => m.userId === senderId);
        return member?.nickname || t("common.unknown");
      }
      return selectedConversation?.name || t("conversation.yourFriendFallback");
    },
    [myUserId, selectedConversation, t]
  );
};

export default useSenderName;
