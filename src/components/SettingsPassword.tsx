import { useState, useCallback } from "react";
import { View } from "react-native";
import { useFocusEffect } from "expo-router";
import profileValidator from "@/src/utils/profileValidator";
import useChangePassword from "@/src/hooks/useChangePassword";
import { useTranslation } from "@/src/hooks/useTranslation";
import CustomButton from "./CustomButton";
import CustomInput from "./CustomInput";

const SettingsPassword = () => {
  const [currentPassword, setCurrentPassword] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const { changePassword, isLoading } = useChangePassword();
  const { checkLengthPassword, checkPassword } = profileValidator();
  const { t } = useTranslation();

  // Clear passwords when switching tabs
  useFocusEffect(
    useCallback(() => {
      setCurrentPassword("");
      setPassword("");
      setConfirmPassword("");
    }, [])
  );

  // Handle onPress
  const handleOnPress = async () => {
    // Validate data before sending to API
    if (
      !currentPassword ||
      !checkLengthPassword(password) ||
      !checkPassword(password, confirmPassword)
    )
      return;

    // Send to backend API
    const success = await changePassword(currentPassword, password);
    if (success) {
      setCurrentPassword("");
      setPassword("");
      setConfirmPassword("");
    }
  };

  const renderField = (
    label: string,
    value: string,
    onChangeText: (text: string) => void
  ) => (
    <CustomInput
      title={label}
      value={value}
      onChangeText={onChangeText}
      isPassword
      maxLength={20}
      autoCapitalize="none"
    />
  );

  // Pure format check for the Save button's enabled state -- must not call
  // checkLengthPassword/checkPassword here, they Alert.alert() on failure
  // and this runs on every render (every keystroke).
  const isValidFormat =
    !!currentPassword &&
    password.length >= 6 &&
    password.length <= 72 &&
    password === confirmPassword;

  return (
    <View>
      <View className="gap-4">
        {renderField(
          t("settings.password.currentLabel"),
          currentPassword,
          setCurrentPassword
        )}
        {renderField(t("settings.password.newLabel"), password, setPassword)}
        {renderField(
          t("settings.password.confirmLabel"),
          confirmPassword,
          setConfirmPassword
        )}
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

export default SettingsPassword;
