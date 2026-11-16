import { useCallback } from "react";
import { AccessibilityInfo, Alert } from "react-native";
import conversationStore, { Message, isTombstone } from "../zustand/conversationStore";
import { useHasFeature } from "../zustand/configStore";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "./useTranslation";
import useMessageActions from "./useMessageActions";

export type MessageActionKey = "reply" | "copy" | "edit" | "delete";

export const MESSAGE_ACTION_ICONS: Record<MessageActionKey, string> = {
  reply: "reply",
  copy: "content-copy",
  edit: "pencil-outline",
  delete: "delete-outline",
};

const LABEL_KEYS: Record<MessageActionKey, string> = {
  reply: "conversation.messageActions.reply",
  copy: "conversation.messageActions.copyText",
  edit: "conversation.messageActions.edit",
  delete: "conversation.messageActions.deleteForEveryone",
};

// Loaded on demand, like expo-clipboard below: if the installed dev build
// lacks the native module, the import throws and we just skip the haptic.
export const haptic = async (kind: "light" | "success") => {
  try {
    const Haptics = await import("expo-haptics");
    if (kind === "success") {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  } catch {
    // No haptics available
  }
};

// Which actions a message offers, and what each one does. Shared by the
// tap menu (MessageActionSheet) and the VoiceOver actions on each bubble,
// so both always list the same things.
const useMessageActionHandlers = () => {
  const { authState } = useAuth();
  const { t } = useTranslation();
  const myUserId = authState?.user?._id;
  const canReply = useHasFeature("reply");
  const canEdit = useHasFeature("edit");
  const canDelete = useHasFeature("delete");
  const startReply = conversationStore((s) => s.startReply);
  const startEdit = conversationStore((s) => s.startEdit);
  const { deleteForEveryone } = useMessageActions();

  const available = useCallback(
    (m: Message): MessageActionKey[] => {
      if (isTombstone(m)) return [];
      const mine = m.senderId === myUserId;
      const hasText = !!m.message;
      const keys: MessageActionKey[] = [];
      if (canReply) keys.push("reply");
      if (hasText) keys.push("copy");
      // Photo-only messages have no text to edit
      if (mine && hasText && canEdit) keys.push("edit");
      if (mine && canDelete) keys.push("delete");
      return keys;
    },
    [myUserId, canReply, canEdit, canDelete]
  );

  const labelFor = useCallback((key: MessageActionKey) => t(LABEL_KEYS[key]), [t]);

  const confirmDelete = (m: Message) => {
    Alert.alert(
      t("conversation.messageActions.deleteConfirmTitle"),
      t("conversation.messageActions.deleteConfirmMessage"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("common.delete"),
          style: "destructive",
          onPress: () => {
            deleteForEveryone(m._id);
          },
        },
      ]
    );
  };

  const copyText = async (m: Message) => {
    if (!m.message) return;
    try {
      // expo-clipboard is loaded on demand (see EditAddFriend.tsx)
      const Clipboard = await import("expo-clipboard");
      await Clipboard.setStringAsync(m.message);
      haptic("success");
      AccessibilityInfo.announceForAccessibility(t("conversation.messageActions.copied"));
    } catch {
      Alert.alert(t("conversation.messageActions.copyFailed"));
    }
  };

  const perform = (m: Message, key: MessageActionKey) => {
    switch (key) {
      case "reply":
        startReply(m);
        break;
      case "copy":
        copyText(m);
        break;
      case "edit":
        startEdit(m);
        break;
      case "delete":
        confirmDelete(m);
        break;
    }
  };

  return { available, perform, labelFor };
};

export default useMessageActionHandlers;
