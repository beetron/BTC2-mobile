import { Text, TouchableOpacity } from "react-native";
import React from "react";
import { useTranslation } from "../hooks/useTranslation";

interface CustomButtonProps {
  title: string;
  handlePress?: () => void;
  containerStyles?: string;
  textStyles?: string;
  isLoading?: boolean;
  disabled?: boolean;
}

const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  handlePress,
  containerStyles,
  textStyles,
  isLoading,
  disabled,
}) => {
  const isDisabled = isLoading || disabled;
  const { t } = useTranslation();

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={isDisabled}
      activeOpacity={0.7}
      className={` ${containerStyles} rounded-xl
         min-h-[50px]
          justify-center items-center
          ${isDisabled ? "bg-btc400 opacity-50" : "bg-btc300"}`}
    >
      <Text
        className={`text-3xl ${isDisabled ? "text-btc300" : "text-btc100"} ${textStyles}`}
      >
        {isLoading ? t("common.loading") : title}
      </Text>
    </TouchableOpacity>
  );
};

export default CustomButton;
