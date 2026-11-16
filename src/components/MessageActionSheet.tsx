import React, { useRef } from "react";
import { View, Text } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import ActionSheet, { ActionSheetOption } from "./ActionSheet";
import conversationStore, { Message } from "../zustand/conversationStore";
import { useThemeColors } from "../context/ThemeContext";
import { useTypeScale } from "../hooks/useTypeScale";
import { useTranslation } from "../hooks/useTranslation";
import { senderColorFor } from "../constants/theme";
import useSenderName from "../hooks/useSenderName";
import { useAuth } from "../context/AuthContext";
import useMessageActionHandlers, {
  MESSAGE_ACTION_ICONS,
} from "../hooks/useMessageActionHandlers";

interface MessageActionSheetProps {
  // The tapped message; null when the sheet is closed
  message: Message | null;
  onClose: () => void;
}

// Trimmed copy of the tapped bubble shown above the options, so it's clear
// which message they act on (the chat behind is dimmed by the sheet).
const MessagePreview = ({ message }: { message: Message }) => {
  const colors = useThemeColors();
  const ts = useTypeScale();
  const { t } = useTranslation();
  const { authState } = useAuth();
  const nameOf = useSenderName();
  const isGroup = conversationStore((s) => s.selectedConversation?.type === "group");
  const isMine = message.senderId === authState?.user?._id;
  const photoCount = message.imageFiles?.length ?? 0;
  const photosExpired = photoCount > 0 && !!message.imagesExpiredAt;

  return (
    <View className={`px-3.5 py-3 gap-1 ${isMine ? "items-end" : "items-start"}`}>
      {isGroup && !isMine && (
        <Text
          className={`${ts.label} mx-1`}
          style={{ color: senderColorFor(colors, message.senderId) }}
          numberOfLines={1}
        >
          {nameOf(message.senderId)}
        </Text>
      )}
      <View
        className="px-3.5 py-2.5"
        style={{
          maxWidth: "88%",
          backgroundColor: isMine ? colors.primary : colors.bubbleOther,
          borderWidth: isMine ? 0 : 1,
          borderColor: colors.border,
          borderRadius: 18,
          ...(isMine ? { borderBottomRightRadius: 6 } : { borderBottomLeftRadius: 6 }),
        }}
      >
        {message.message ? (
          <Text
            className={ts.body}
            style={{ color: isMine ? colors.onPrimary : colors.ink }}
            numberOfLines={3}
          >
            {/* Capped so a 10,000-character message isn't laid out just
                to show three lines */}
            {message.message.length > 400 ? `${message.message.slice(0, 400)}…` : message.message}
          </Text>
        ) : photoCount > 0 ? (
          <View className="flex-row items-center gap-1.5">
            <MaterialCommunityIcons
              name={photosExpired ? "image-off-outline" : "image-outline"}
              size={18}
              color={isMine ? colors.onPrimary : colors.inkMuted}
            />
            <Text
              className={`${ts.body} flex-shrink`}
              style={{ color: isMine ? colors.onPrimary : colors.inkMuted }}
              numberOfLines={1}
            >
              {photosExpired
                ? photoCount > 1
                  ? t("conversation.photosExpired", { count: photoCount })
                  : t("conversation.quote.photoExpired")
                : photoCount > 1
                  ? t("conversation.a11y.photos", { count: photoCount })
                  : t("conversation.quote.photo")}
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
};

// The message menu opened by tapping a bubble: Reply / Copy text / Edit /
// Delete for everyone, filtered by sender and the API's feature flags.
// Built on the centered, fading ActionSheet.
const MessageActionSheet = ({ message, onClose }: MessageActionSheetProps) => {
  const { available, perform, labelFor } = useMessageActionHandlers();
  // Keep drawing the last message while the sheet fades out, instead of
  // collapsing to an empty card mid-fade
  const lastMessage = useRef<Message | null>(message);
  if (message) lastMessage.current = message;
  const shown = message ?? lastMessage.current;

  const options: ActionSheetOption[] = shown
    ? available(shown).map((key) => ({
        label: labelFor(key),
        icon: MESSAGE_ACTION_ICONS[key],
        variant: key === "delete" ? "danger" : "default",
        onPress: () => perform(shown, key),
      }))
    : [];

  return (
    <ActionSheet
      visible={!!message && options.length > 0}
      onClose={onClose}
      options={options}
      header={shown ? <MessagePreview message={shown} /> : undefined}
    />
  );
};

export default MessageActionSheet;
