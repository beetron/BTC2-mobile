import React from "react";
import { View, Text } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import conversationStore, { ReplyPreview } from "../zustand/conversationStore";
import { useTheme } from "../context/ThemeContext";
import { senderColorFor } from "../constants/theme";
import { useTypeScale } from "../hooks/useTypeScale";
import { useTranslation } from "../hooks/useTranslation";
import useSenderName from "../hooks/useSenderName";
import { toSnippet } from "../utils/snippet";
import ReplyPhotoThumb from "./ReplyPhotoThumb";

interface QuotedMessageProps {
  replyTo: ReplyPreview;
  // Inside one of my own (primary-colored) bubbles
  onPrimary: boolean;
}

// Plain-text summary of a quote, also used for accessibility labels
export const useQuoteSummary = () => {
  const { t } = useTranslation();
  return (replyTo: ReplyPreview): string => {
    if (replyTo.unavailable) return t("conversation.quote.unavailable");
    if (replyTo.deleted) return t("conversation.quote.deleted");
    if (replyTo.message) return toSnippet(replyTo.message);
    if (replyTo.imagesExpired) return t("conversation.quote.photoExpired");
    if (replyTo.hasImages) return t("conversation.quote.photo");
    return "";
  };
};

// The quoted message at the top of a reply bubble. Display only (tapping
// it does nothing for now). Covers the three states the API sends: normal,
// original deleted for everyone, and original no longer available.
const QuotedMessage = ({ replyTo, onPrimary }: QuotedMessageProps) => {
  const { colors, scheme } = useTheme();
  const ts = useTypeScale();
  const { t } = useTranslation();
  const senderName = useSenderName();
  const isGroup = conversationStore(
    (s) => s.selectedConversation?.type === "group",
  );

  const textColor = onPrimary ? colors.onPrimary : colors.ink;
  const mutedColor = onPrimary ? colors.onPrimary : colors.inkMuted;
  // Group names keep their sender tint (all 5.5:1+ on surfaceMuted);
  // elsewhere ink, since primary on surfaceMuted is only 4.2:1 in light
  const nameColor = onPrimary
    ? colors.onPrimary
    : isGroup && replyTo.senderId
      ? senderColorFor(colors, replyTo.senderId)
      : colors.ink;
  // Inside my bubble the quote is a darker wash of the blue in both themes.
  // A light wash (onPrimary/15 in light mode) drops white text to 3.7:1;
  // ink/15 keeps it at 5.8:1, and onPrimary/15 is 6.0:1 in dark mode.
  const mineWash = scheme === "dark" ? "bg-onPrimary/15" : "bg-ink/15";

  const gone = replyTo.unavailable || replyTo.deleted;
  const text = toSnippet(replyTo.message);
  const expired = !gone && !!replyTo.imagesExpired;
  // API 2.1 sends the first photo's filename (imageFile, null when there is
  // none to show). An older API sends only hasImages: then fall back to the
  // original's first photo if it is among the loaded messages.
  const loadedPhoto = conversationStore((s) =>
    replyTo.imageFile === undefined && replyTo.hasImages && !gone
      ? s.messages.find((m) => m._id === replyTo._id && !m.imagesExpiredAt)
          ?.imageFiles?.[0]
      : undefined,
  );
  const photo = gone || expired ? null : (replyTo.imageFile ?? loadedPhoto);

  return (
    // One column: the sender's name on top, then the quoted text, the
    // photo thumbnail, or a label (deleted / unavailable / photo expired)
    <View
      className={`items-start rounded-[14px] px-2.5 py-1.5 ${onPrimary ? mineWash : "bg-surfaceMuted"}`}
      style={{ minHeight: 36 }}
    >
      {!replyTo.unavailable && (
        <Text
          className={ts.label}
          style={{ color: nameColor }}
          numberOfLines={1}
        >
          {senderName(replyTo.senderId)}
        </Text>
      )}
      {gone ? (
        <View className="flex-row items-center gap-1.5">
          <MaterialCommunityIcons name="cancel" size={14} color={mutedColor} />
          <Text
            className={`${ts.caption} italic flex-shrink`}
            style={{ color: mutedColor }}
            numberOfLines={2}
          >
            {replyTo.unavailable
              ? t("conversation.quote.unavailable")
              : t("conversation.quote.deleted")}
          </Text>
        </View>
      ) : text ? (
        // Two lines at most however long the original is; a long word or
        // URL with no spaces breaks mid-word rather than widening the bubble
        <Text
          className={ts.caption}
          style={{ color: textColor }}
          numberOfLines={2}
        >
          {text}
        </Text>
      ) : photo ? (
        // The thumbnail itself says "photo"; no icon or label next to it
        <View className="mt-1">
          <ReplyPhotoThumb key={photo} filename={photo} size={48} />
        </View>
      ) : replyTo.hasImages ? (
        // No thumbnail to show: an older API without imageFile and the
        // original not loaded, or expired photos (files removed after the
        // retention period), which get a label of their own
        <View className="flex-row items-center gap-1.5">
          <MaterialCommunityIcons
            name={expired ? "image-off-outline" : "image-outline"}
            size={14}
            color={mutedColor}
          />
          <Text
            className={`${ts.caption} flex-shrink`}
            style={{ color: mutedColor }}
            numberOfLines={2}
          >
            {expired
              ? t("conversation.quote.photoExpired")
              : t("conversation.quote.photo")}
          </Text>
        </View>
      ) : null}
    </View>
  );
};

export default QuotedMessage;
