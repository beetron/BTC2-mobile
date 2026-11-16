import React, { useRef } from "react";
import {
  View,
  Text,
  Pressable,
  Linking,
  AccessibilityActionEvent,
} from "react-native";
import Autolink from "react-native-autolink";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import {
  Message,
  ConversationMember,
  isTombstone,
} from "../zustand/conversationStore";
import { useThemeColors } from "../context/ThemeContext";
import { useTypeScale, useBodyFontSize } from "../hooks/useTypeScale";
import { useTranslation } from "../hooks/useTranslation";
import { senderColorFor } from "../constants/theme";
import formatDate from "../utils/formatDate";
import { extractFirstUrl } from "../utils/extractFirstUrl";
import useGetMessageImages from "../hooks/useGetMessageImages";
import { MessageActionKey } from "../hooks/useMessageActionHandlers";
import Avatar from "./Avatar";
import MessageImageGallery, {
  MessageImageGalleryHandle,
} from "./MessageImageGallery";
import LinkPreviewCard from "./LinkPreviewCard";
import QuotedMessage, { useQuoteSummary } from "./QuotedMessage";
import useSenderName from "../hooks/useSenderName";

interface MessageBubbleProps {
  message: Message;
  isMine: boolean;
  isGroup: boolean;
  // Group chats: the sender's member record (name, avatar)
  sender?: ConversationMember | null;
  otherAvatarData?: string | null;
  // Same list the tap menu shows; also exposed as VoiceOver actions
  actions: MessageActionKey[];
  actionLabel: (key: MessageActionKey) => string;
  onOpenActions: (message: Message) => void;
  onAction: (message: Message, key: MessageActionKey) => void;
}

const MINE_RADII = {
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
  borderBottomLeftRadius: 20,
  borderBottomRightRadius: 6,
};
const OTHER_RADII = {
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
  borderBottomRightRadius: 20,
  borderBottomLeftRadius: 6,
};

// One message in the thread. Touching and holding anywhere on the bubble
// opens the message actions; links, photos and link-preview cards inside
// it are their own touchables, so a tap on them opens them as before.
const MessageBubble = ({
  message,
  isMine,
  isGroup,
  sender,
  otherAvatarData,
  actions,
  actionLabel,
  onOpenActions,
  onAction,
}: MessageBubbleProps) => {
  const colors = useThemeColors();
  const ts = useTypeScale();
  const bodySize = useBodyFontSize();
  const { t } = useTranslation();
  const { getMessageImageSource } = useGetMessageImages();
  const quoteSummary = useQuoteSummary();
  const nameOf = useSenderName();
  const senderName = nameOf(message.senderId);
  const galleryRef = useRef<MessageImageGalleryHandle>(null);

  const deleted = isTombstone(message);
  const images = message.imageFiles ?? [];
  // Photo files removed after the retention period: placeholders only
  const photosExpired = images.length > 0 && !!message.imagesExpiredAt;
  const firstUrl = deleted
    ? null
    : extractFirstUrl(message.message ?? undefined);
  // An edited message shows when it was last edited, not when it was sent
  const time = message.editedAt
    ? `${t("conversation.edited")} · ${formatDate(message.editedAt)}`
    : formatDate(message.createdAt);

  const footer = (
    <Text
      className={`${ts.caption} text-inkMuted mt-1 ${isMine ? "mr-1.5" : "ml-1.5"}`}
    >
      {deleted ? formatDate(message.createdAt) : time}
    </Text>
  );

  // Others' messages in a group: avatar + tinted sender name around the bubble
  const wrapOther = (content: React.ReactNode) => (
    <View
      className="flex-row items-end mb-3 mr-auto gap-2"
      style={{ maxWidth: "84%" }}
    >
      {isGroup && <Avatar uri={otherAvatarData} size={28} />}
      <View className="flex-shrink items-start">
        {isGroup && (
          <Text
            className={`${ts.label} ml-2.5 mb-1`}
            style={{ color: senderColorFor(colors, message.senderId) }}
            numberOfLines={1}
          >
            {sender?.nickname || t("common.unknown")}
          </Text>
        )}
        {content}
        {footer}
      </View>
    </View>
  );

  const wrapMine = (content: React.ReactNode) => (
    <View className="items-end mb-3 ml-auto" style={{ maxWidth: "80%" }}>
      {content}
      {footer}
    </View>
  );

  const wrap = isMine ? wrapMine : wrapOther;

  if (deleted) {
    // Dashed borders need uniform radii on iOS, hence no tail corner here
    return wrap(
      <View
        className="flex-row items-center gap-2 px-3.5 py-2"
        style={{
          minHeight: 40,
          borderWidth: 1,
          borderStyle: "dashed",
          borderColor: colors.inkSubtle,
          borderRadius: 20,
        }}
        accessible
        accessibilityLabel={`${senderName}, ${t("conversation.deletedPlaceholder")}`}
      >
        <MaterialCommunityIcons
          name="cancel"
          size={16}
          color={colors.inkMuted}
        />
        <Text className={`${ts.label} italic text-inkMuted flex-shrink`}>
          {t("conversation.deletedPlaceholder")}
        </Text>
      </View>,
    );
  }

  const textColor = isMine ? colors.onPrimary : colors.ink;
  const linkColor = isMine ? colors.onPrimary : colors.primary;

  // VoiceOver reads the bubble as one element, which hides the links and
  // thumbnails inside it -- so those get actions of their own too.
  const a11yLabel = [
    senderName,
    message.replyTo
      ? message.replyTo.unavailable
        ? quoteSummary(message.replyTo)
        : t("conversation.a11y.replyTo", {
            name: nameOf(message.replyTo.senderId),
            text: quoteSummary(message.replyTo),
          })
      : null,
    message.message || null,
    photosExpired
      ? images.length > 1
        ? t("conversation.photosExpired", { count: images.length })
        : t("conversation.quote.photoExpired")
      : images.length > 1
        ? t("conversation.a11y.photos", { count: images.length })
        : images.length === 1
          ? t("conversation.quote.photo")
          : null,
    time,
  ]
    .filter(Boolean)
    .join(", ");

  const a11yActions = [
    // Double-tap, and double-tap-and-hold, both open the menu
    { name: "activate" },
    { name: "longpress" },
    ...actions.map((key) => ({ name: key, label: actionLabel(key) })),
    ...(images.length > 0 && !photosExpired
      ? [{ name: "viewPhotos", label: t("conversation.a11y.viewPhotos") }]
      : []),
    ...(firstUrl
      ? [{ name: "openLink", label: t("conversation.a11y.openLink") }]
      : []),
  ];

  const handleA11yAction = (event: AccessibilityActionEvent) => {
    const name = event.nativeEvent.actionName;
    if (name === "activate" || name === "longpress") onOpenActions(message);
    else if (name === "viewPhotos") galleryRef.current?.open(0);
    else if (name === "openLink" && firstUrl)
      Linking.openURL(firstUrl).catch(() => {});
    else if ((actions as string[]).includes(name))
      onAction(message, name as MessageActionKey);
  };

  // Photos, link cards and links are touchables of their own, so a hold
  // on them never reaches the bubble's Pressable (the innermost touchable
  // gets the touch). Each one is handed the same handler instead, so holding
  // anywhere on the bubble opens the menu; a tap on them still opens them.
  const openMenu = () => onOpenActions(message);

  return wrap(
    // Long-press only: a plain tap does nothing, so taps while scrolling a
    // long history never open the menu. No pressed dimming either, since it
    // would flash on every touch that starts a scroll; the haptic and the
    // sheet are the feedback once the hold completes. VoiceOver users get
    // the menu from double-tap (the "activate" action) instead.
    <Pressable
      onLongPress={openMenu}
      accessibilityRole="button"
      accessibilityLabel={a11yLabel}
      accessibilityHint={t("conversation.messageActions.showActionsHint")}
      accessibilityActions={a11yActions}
      onAccessibilityAction={handleA11yAction}
    >
      {/* The bubble look lives on a plain View, never on Pressable's
          `style`: NativeWind wraps Pressable and silently drops a function
          style ({ pressed }) => ..., which left bubbles with no background
          (white-on-white text). */}
      <View
        style={{
          // A reply hugs its quote: tighter padding, the text gets its own
          ...(message.replyTo
            ? { paddingTop: 6, paddingHorizontal: 6, paddingBottom: 6 }
            : { paddingHorizontal: 14, paddingVertical: 10 }),
          backgroundColor: isMine ? colors.primary : colors.bubbleOther,
          borderWidth: isMine ? 0 : 1,
          borderColor: colors.border,
          ...(isMine ? MINE_RADII : OTHER_RADII),
        }}
      >
        {message.replyTo && (
          <QuotedMessage replyTo={message.replyTo} onPrimary={isMine} />
        )}
        {message.message ? (
          <View className={message.replyTo ? "px-2 pt-1.5 pb-1" : ""}>
            <Autolink
              text={message.message}
              className={ts.body}
              style={{ color: textColor, fontSize: bodySize }}
              linkStyle={{
                color: linkColor,
                textDecorationLine: "underline",
              }}
              onLongPress={openMenu}
            />
          </View>
        ) : null}
        {images.length > 0 && (
          <View className={message.replyTo ? "px-2 pb-1" : ""}>
            <MessageImageGallery
              ref={galleryRef}
              imageFilenames={images}
              imageSources={images.map((filename) =>
                getMessageImageSource(filename),
              )}
              onLongPress={openMenu}
              expired={photosExpired}
            />
          </View>
        )}
        {firstUrl && (
          <View className={message.replyTo ? "px-2 pb-1" : ""}>
            <LinkPreviewCard url={firstUrl} onLongPress={openMenu} />
          </View>
        )}
      </View>
    </Pressable>,
  );
};

export default React.memo(MessageBubble);
