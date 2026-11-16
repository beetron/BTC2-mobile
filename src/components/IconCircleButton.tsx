import React from "react";
import { TouchableOpacity } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useThemeColors } from "../context/ThemeContext";

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>["name"];

interface IconCircleButtonProps {
  icon: IconName;
  onPress?: () => void;
  accessibilityLabel: string;
  variant?: "primary" | "outline" | "muted" | "plain";
  size?: number;
  iconSize?: number;
  disabled?: boolean;
}

// 44pt round icon button used in headers and the chat composer. Colors are
// inline style (not className swaps) -- see CustomButton for why.
const IconCircleButton = ({
  icon,
  onPress,
  accessibilityLabel,
  variant = "outline",
  size = 44,
  iconSize = 22,
  disabled,
}: IconCircleButtonProps) => {
  const colors = useThemeColors();

  const style = {
    primary: { backgroundColor: colors.primary, borderWidth: 0 },
    outline: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
    muted: { backgroundColor: colors.surfaceMuted, borderWidth: 0 },
    plain: { backgroundColor: "transparent", borderWidth: 0 },
  }[variant];
  const iconColor = variant === "primary" ? colors.onPrimary : colors.ink;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          alignItems: "center",
          justifyContent: "center",
          opacity: disabled ? 0.4 : 1,
        },
        style,
      ]}
    >
      <MaterialCommunityIcons name={icon} size={iconSize} color={iconColor} />
    </TouchableOpacity>
  );
};

export default IconCircleButton;
