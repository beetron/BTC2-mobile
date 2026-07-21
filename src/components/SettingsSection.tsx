import { View, Text } from "react-native";
import React from "react";

interface SettingsSectionProps {
  title: string;
  children: React.ReactNode;
  variant?: "default" | "danger";
}

const SettingsSection: React.FC<SettingsSectionProps> = ({
  title,
  children,
  variant = "default",
}) => {
  const isDanger = variant === "danger";

  return (
    <View className="mb-5">
      <Text
        className={`font-funnel-regular text-sm mb-2 ml-1 ${
          isDanger ? "text-danger" : "text-btc200"
        }`}
      >
        {title}
      </Text>
      <View
        className={`rounded-xl overflow-hidden ${
          isDanger ? "bg-dangerBg border border-dangerBorder p-3" : "bg-card"
        }`}
      >
        {children}
      </View>
    </View>
  );
};

export default SettingsSection;
