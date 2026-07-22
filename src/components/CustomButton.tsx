import { Text, TouchableOpacity } from "react-native";
import React from "react";
import { useTranslation } from "../hooks/useTranslation";
import { colors } from "../constants/colors";

interface CustomButtonProps {
  title: string;
  handlePress?: () => void;
  containerStyles?: string;
  textStyles?: string;
  isLoading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "danger";
}

const VARIANT_COLOR: Record<NonNullable<CustomButtonProps["variant"]>, string> = {
  primary: colors.accent,
  secondary: colors.btc400,
  danger: colors.danger,
};

const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  handlePress,
  containerStyles,
  textStyles,
  isLoading,
  disabled,
  variant = "primary",
}) => {
  const isDisabled = isLoading || disabled;
  const { t, locale } = useTranslation();
  // Noto Sans JP renders visibly larger than Funnel Display at the same
  // nominal size, so Japanese uses one step down here.
  const textSize = locale === "ja" ? "text-2xl" : "text-3xl";

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={isDisabled}
      activeOpacity={0.7}
      className={`${containerStyles} rounded-xl min-h-[50px] justify-center items-center`}
      style={{
        backgroundColor: isDisabled ? colors.card : VARIANT_COLOR[variant],
      }}
    >
      <Text
        className={`${textSize} ${textStyles}`}
        style={{ color: isDisabled ? colors.btc300 : colors.btc100 }}
      >
        {isLoading ? t("common.loading") : title}
      </Text>
    </TouchableOpacity>
  );
};

export default CustomButton;
