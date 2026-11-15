import React from "react";
import { View, Text, Keyboard, TouchableWithoutFeedback } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import Logo from "./Logo";
import HeaderBackButton from "./HeaderBackButton";
import { useTypeScale } from "../hooks/useTypeScale";

interface AuthScreenProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  // Top-right slot (language toggle on Login)
  topRight?: React.ReactNode;
  // Pinned under the form (e.g. "New to bTC2? Create an account")
  footer?: React.ReactNode;
  children: React.ReactNode;
}

// Shared shell for Login / Signup / Forgot*. Everything scrolls with the
// keyboard, so a longer Japanese subtitle, wrapped labels or a small screen
// never pushes the button out of reach. Fields are full width (the old
// w-3/5 columns were too narrow for JA labels).
const AuthScreen = ({
  title,
  subtitle,
  showBack,
  topRight,
  footer,
  children,
}: AuthScreenProps) => {
  const ts = useTypeScale();

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingBottom: 24 }}
        bottomOffset={40}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View className="flex-1">
            <View className="flex-row items-center justify-between" style={{ minHeight: 48 }}>
              <View className="-ml-3">{showBack ? <HeaderBackButton routerOption="back" /> : null}</View>
              {topRight}
            </View>

            <View className="items-center gap-3.5 mt-6 mb-8">
              <Logo size={showBack ? 72 : 88} />
              <Text
                className={`${ts.largeTitle} text-ink text-center`}
                accessibilityRole="header"
              >
                {title}
              </Text>
              {subtitle ? (
                <Text className={`${ts.body} text-inkMuted text-center px-2`}>{subtitle}</Text>
              ) : null}
            </View>

            <View className="gap-4">{children}</View>

            <View className="flex-1" style={{ minHeight: 24 }} />
            {footer}
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default AuthScreen;
