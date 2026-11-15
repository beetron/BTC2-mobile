import { useState, useCallback } from "react";
import { Text, View } from "react-native";
import { useFocusEffect } from "expo-router";
import profileValidator from "@/src/utils/profileValidator";
import useUpdateEmail from "@/src/hooks/useUpdateEmail";
import { useAuth } from "@/src/context/AuthContext";
import { useTranslation } from "@/src/hooks/useTranslation";
import CustomButton from "./CustomButton";
import CustomInput from "./CustomInput";
import { useTypeScale } from "@/src/hooks/useTypeScale";

const SettingsEmail = () => {
  const { authState, setAuthState } = useAuth();
  const currentEmail = authState?.user?.email;
  const [currentPassword, setCurrentPassword] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const { updateEmail, isLoading } = useUpdateEmail();
  const { checkEmailRegex } = profileValidator();
  const { t } = useTranslation();
  const ts = useTypeScale();

  // Clear fields when switching tabs
  useFocusEffect(
    useCallback(() => {
      setCurrentPassword("");
      setEmail("");
    }, [])
  );

  // Handle onPress
  const handleOnPress = async () => {
    // Validate data before sending to API
    if (!currentPassword || !checkEmailRegex(email)) return;

    // Send to backend API
    const success = await updateEmail(email, currentPassword);
    if (success) {
      if (setAuthState) {
        setAuthState((prev) => ({
          ...prev,
          user: prev.user ? { ...prev.user, email } : null,
        }));
      }
      setCurrentPassword("");
      setEmail("");
    }
  };

  // Pure format check for the Save button's enabled state -- must not call
  // checkEmailRegex here, it Alert.alert()s on failure and this runs on
  // every render (every keystroke).
  const isValidFormat =
    !!currentPassword && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  return (
    <View>
      <View className="gap-4">
        <View className="gap-2">
          <Text className={`${ts.label} text-ink`}>{t("settings.email.currentLabel")}</Text>
          <Text
            className={`${ts.body} text-inkMuted bg-surfaceMuted rounded-2xl px-4 py-3.5`}
            numberOfLines={2}
          >
            {currentEmail}
          </Text>
        </View>
        <CustomInput
          title={t("settings.email.currentPasswordLabel")}
          value={currentPassword}
          onChangeText={setCurrentPassword}
          isPassword
          maxLength={72}
          autoCapitalize="none"
        />
        <CustomInput
          title={t("settings.email.newLabel")}
          value={email}
          onChangeText={setEmail}
          maxLength={50}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
        />
      </View>
      <CustomButton
        title={t("common.save")}
        handlePress={handleOnPress}
        isLoading={isLoading}
        disabled={!isValidFormat}
        containerStyles="mt-6"
      />
    </View>
  );
};

export default SettingsEmail;
