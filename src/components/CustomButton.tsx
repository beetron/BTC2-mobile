import { ActivityIndicator, Text, TouchableOpacity } from "react-native";
import React from "react";
import { useThemeColors } from "../context/ThemeContext";
import { useTypeScale } from "../hooks/useTypeScale";

interface CustomButtonProps {
  title: string;
  handlePress?: () => void;
  containerStyles?: string;
  textStyles?: string;
  isLoading?: boolean;
  disabled?: boolean;
  // "secondary" is kept as an alias of "soft" for older call sites
  variant?: "primary" | "soft" | "secondary" | "danger" | "dangerSoft" | "dangerGhost" | "ghost";
}

const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  handlePress,
  containerStyles = "",
  textStyles = "",
  isLoading,
  disabled,
  variant = "primary",
}) => {
  const colors = useThemeColors();
  const ts = useTypeScale();
  const isDisabled = isLoading || disabled;

  // Colors stay inline style, not className -- swapping NativeWind classes on
  // disabled/variant changes caused a visible two-stage render lag here.
  const palette = {
    primary: { bg: colors.primary, fg: colors.onPrimary, border: "transparent" },
    soft: { bg: colors.primarySoft, fg: colors.primary, border: "transparent" },
    secondary: { bg: colors.primarySoft, fg: colors.primary, border: "transparent" },
    danger: { bg: colors.danger, fg: colors.onDanger, border: "transparent" },
    dangerSoft: { bg: colors.surface, fg: colors.danger, border: colors.border },
    dangerGhost: { bg: "transparent", fg: colors.danger, border: "transparent" },
    ghost: { bg: "transparent", fg: colors.primary, border: "transparent" },
  }[variant];

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={isDisabled}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!isDisabled, busy: !!isLoading }}
      className={`${containerStyles} rounded-2xl justify-center items-center flex-row px-5`}
      style={{
        minHeight: 52,
        paddingVertical: 10,
        backgroundColor:
          isDisabled && palette.bg !== "transparent" ? colors.surfaceMuted : palette.bg,
        borderWidth: palette.border === "transparent" ? 0 : 1,
        borderColor: palette.border,
      }}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color={colors.inkMuted} />
      ) : (
        // One line that shrinks slightly before it would truncate -- keeps
        // longer Japanese labels inside the button instead of wrapping.
        <Text
          className={`${ts.button} ${textStyles}`}
          style={{ color: isDisabled ? colors.inkMuted : palette.fg }}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.85}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

export default CustomButton;
