import React from "react";
import { View, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTypeScale } from "../hooks/useTypeScale";

interface ScreenHeaderProps {
  title: string;
  // Optional leading element (e.g. the logo tile on Chats)
  leading?: React.ReactNode;
  // Right-aligned actions, typically IconCircleButton(s)
  actions?: React.ReactNode;
}

// Large-title header for the three tab roots. Title can shrink/wrap instead
// of colliding with the actions, which matters for longer Japanese titles.
const ScreenHeader = ({ title, leading, actions }: ScreenHeaderProps) => {
  const insets = useSafeAreaInsets();
  const ts = useTypeScale();

  return (
    <View
      className="flex-row items-center px-5 pb-3 gap-3"
      style={{ paddingTop: insets.top + 12 }}
    >
      {leading}
      <Text
        className={`${ts.largeTitle} text-ink flex-1 flex-shrink`}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.8}
        accessibilityRole="header"
      >
        {title}
      </Text>
      {actions ? <View className="flex-row gap-2">{actions}</View> : null}
    </View>
  );
};

export default ScreenHeader;
