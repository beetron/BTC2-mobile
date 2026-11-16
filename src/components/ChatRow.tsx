import React from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import Badge from "./Badge";
import { useThemeColors } from "../context/ThemeContext";
import { useTypeScale } from "../hooks/useTypeScale";
import { useTranslation } from "../hooks/useTranslation";

interface ChatRowProps {
  avatar: React.ReactNode;
  name: string;
  // Secondary line when there's nothing unread (e.g. group member count)
  subtitle?: string;
  timestamp?: string | null;
  unreadCount: number;
  isBusy?: boolean;
  onPress: () => void;
}

// One chat on the Chats list, drawn as a "capsule": a fully rounded white
// pill with the avatar tucked into its left end, floating on the page with a
// gap between each. Unread chats get an accent outline, the time folds into
// the subtitle ("9:41 · 3 new") and a larger count badge sits on the right.
//
// Height is a minimum, never fixed, so a taller Japanese line grows the pill;
// the name truncates and the right column keeps its natural width.
const ChatRow = ({
  avatar,
  name,
  subtitle,
  timestamp,
  unreadCount,
  isBusy,
  onPress,
}: ChatRowProps) => {
  const colors = useThemeColors();
  const ts = useTypeScale();
  const { t } = useTranslation();
  const hasUnread = unreadCount > 0;
  const shownCount = unreadCount > 99 ? "99+" : unreadCount;

  const secondLine = hasUnread
    ? [timestamp, t("home.newCountShort", { count: shownCount })].filter(Boolean).join(" · ")
    : subtitle;
  const a11yUnread = hasUnread
    ? unreadCount === 1
      ? t("home.newMessageOne")
      : t("home.newMessages", { count: shownCount })
    : undefined;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isBusy}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={[name, a11yUnread ?? subtitle, timestamp].filter(Boolean).join(", ")}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        minHeight: 62,
        paddingVertical: 6,
        paddingLeft: 6,
        paddingRight: 16,
        borderRadius: 40,
        backgroundColor: colors.surface,
        borderWidth: 2,
        borderColor: hasUnread ? colors.primary : "transparent",
        opacity: isBusy ? 0.5 : 1,
        shadowColor: "#0F2530",
        shadowOpacity: 0.06,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 1,
      }}
    >
      {avatar}
      <View className="flex-1 min-w-0">
        <Text className={`${ts.bodyStrong} text-ink`} numberOfLines={1}>
          {name}
        </Text>
        {secondLine ? (
          <Text
            className={hasUnread ? ts.label : `${ts.label} text-inkMuted`}
            style={hasUnread ? { color: colors.primary } : undefined}
            numberOfLines={1}
          >
            {secondLine}
          </Text>
        ) : null}
      </View>
      {isBusy ? (
        <ActivityIndicator size="small" color={colors.primary} />
      ) : hasUnread ? (
        <Badge count={unreadCount} tone="primary" large />
      ) : timestamp ? (
        <Text className={`${ts.caption} text-inkMuted`} numberOfLines={1}>
          {timestamp}
        </Text>
      ) : null}
    </TouchableOpacity>
  );
};

export default ChatRow;
