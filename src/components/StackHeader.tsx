import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import HeaderBackButton from "./HeaderBackButton";
import { useTypeScale } from "../hooks/useTypeScale";

interface StackHeaderProps {
  title?: string;
  subtitle?: string;
  // Between back button and title (e.g. an Avatar in chats)
  leading?: React.ReactNode;
  // Right side (e.g. an overflow menu)
  right?: React.ReactNode;
  // Makes the title block tappable (group chat -> group settings)
  onPressTitle?: () => void;
  backTo?: "back" | "home";
}

// Header for pushed screens. Replaces the old per-screen dark headers
// (RemoveFriendHeader / SettingsChangeIconHeader / ConversationHeader shell).
const StackHeader = ({
  title,
  subtitle,
  leading,
  right,
  onPressTitle,
  backTo = "back",
}: StackHeaderProps) => {
  const insets = useSafeAreaInsets();
  const ts = useTypeScale();

  const titleBlock = (
    <View className="flex-1 min-w-0">
      {title ? (
        <Text
          className={`${ts.title} text-ink`}
          numberOfLines={1}
          ellipsizeMode="tail"
          accessibilityRole="header"
        >
          {title}
        </Text>
      ) : null}
      {subtitle ? (
        <Text className={`${ts.label} text-inkMuted`} numberOfLines={1}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );

  return (
    <View
      className="flex-row items-center bg-surface border-b border-border px-2 pb-2 gap-2"
      style={{ paddingTop: insets.top + 4, minHeight: insets.top + 56 }}
    >
      <HeaderBackButton routerOption={backTo} />
      {leading}
      {onPressTitle ? (
        <TouchableOpacity
          onPress={onPressTitle}
          className="flex-1 min-w-0"
          accessibilityRole="button"
        >
          {titleBlock}
        </TouchableOpacity>
      ) : (
        titleBlock
      )}
      {right}
    </View>
  );
};

export default StackHeader;
