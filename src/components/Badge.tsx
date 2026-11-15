import React from "react";
import { View, Text } from "react-native";
import { useThemeColors } from "../context/ThemeContext";

interface BadgeProps {
  count: number;
  // "alert" = red notification dot (tabs, requests); "primary" = unread pill
  tone?: "alert" | "primary";
  // Caps the displayed number ("99+") so the pill never grows unbounded
  max?: number;
  // Ring around the badge, matching whatever is behind it (tab bar icons)
  ringColor?: string;
  small?: boolean;
  // Chat-list capsules use a larger count pill
  large?: boolean;
}

const Badge = ({ count, tone = "alert", max = 99, ringColor, small, large }: BadgeProps) => {
  const colors = useThemeColors();
  if (count <= 0) return null;

  const height = small ? 18 : large ? 28 : 22;
  const bg = tone === "alert" ? colors.badge : colors.primary;
  const fg = tone === "alert" ? "#FFFFFF" : colors.onPrimary;

  return (
    <View
      style={{
        minWidth: height,
        height,
        paddingHorizontal: small ? 5 : large ? 9 : 7,
        borderRadius: height / 2,
        backgroundColor: bg,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: ringColor ? 2 : 0,
        borderColor: ringColor,
      }}
    >
      <Text
        className="font-funnel-bold"
        style={{ color: fg, fontSize: small ? 10 : large ? 13 : 12 }}
        numberOfLines={1}
      >
        {count > max ? `${max}+` : count}
      </Text>
    </View>
  );
};

export default Badge;
