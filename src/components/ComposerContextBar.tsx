import React from "react";
import { View, Text } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { ComposerState } from "../zustand/conversationStore";
import { useThemeColors } from "../context/ThemeContext";
import { useTypeScale } from "../hooks/useTypeScale";
import { useTranslation } from "../hooks/useTranslation";
import { useAuth } from "../context/AuthContext";
import useSenderName from "../hooks/useSenderName";
import IconCircleButton from "./IconCircleButton";
import { toSnippet } from "../utils/snippet";
import ReplyPhotoThumb from "./ReplyPhotoThumb";

interface ComposerContextBarProps {
  composer: NonNullable<ComposerState>;
  onCancel: () => void;
}

// "Replying to …" / "Editing message" bar above the text box, with a ✕ to
// leave that mode.
const ComposerContextBar = ({ composer, onCancel }: ComposerContextBarProps) => {
  const colors = useThemeColors();
  const ts = useTypeScale();
  const { t } = useTranslation();
  const { authState } = useAuth();
  const nameOf = useSenderName();
  const { mode, target } = composer;
  const isReply = mode === "reply";

  const title = isReply
    ? target.senderId === authState?.user?._id
      ? t("conversation.composer.replyingToSelf")
      : t("conversation.composer.replyingTo", { name: nameOf(target.senderId) })
    : t("conversation.composer.editing");

  const snippet =
    toSnippet(target.message) ||
    ((target.imageFiles?.length ?? 0) > 0
      ? target.imagesExpiredAt
        ? t("conversation.quote.photoExpired")
        : t("conversation.quote.photo")
      : "");

  // Replying to a photo: show it small, next to the "Photo" label
  // (not once the files expired: there is nothing left to load)
  const photo =
    isReply && !target.imagesExpiredAt ? target.imageFiles?.[0] : undefined;

  return (
    <View
      className="flex-row items-center gap-2.5 bg-primarySoft rounded-[14px] pl-3 pr-1 py-1 mb-2"
      style={{ minHeight: 48 }}
    >
      <MaterialCommunityIcons
        name={isReply ? "reply" : "pencil-outline"}
        size={18}
        color={colors.primary}
      />
      <View className="flex-1 py-1">
        {/* The label wraps (Japanese can run long) but stops at two lines
            for a very long nickname; the snippet always truncates */}
        {/* ink, not primary: primary on primarySoft is only 4.2:1 in light
            mode. The icon carries the accent. */}
        <Text className={`${ts.label} text-ink`} numberOfLines={2}>
          {title}
        </Text>
        {!!snippet && (
          <Text className={`${ts.caption} text-inkMuted`} numberOfLines={1}>
            {snippet}
          </Text>
        )}
      </View>
      {photo && <ReplyPhotoThumb key={photo} filename={photo} size={36} />}
      <IconCircleButton
        icon="close"
        variant="plain"
        size={36}
        iconSize={18}
        accessibilityLabel={
          isReply ? t("conversation.composer.cancelReply") : t("conversation.composer.cancelEdit")
        }
        onPress={onCancel}
      />
    </View>
  );
};

export default ComposerContextBar;
