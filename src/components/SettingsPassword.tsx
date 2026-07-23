import { useState, useCallback } from "react";
import { Text, TextInput, View, TouchableOpacity } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useFocusEffect } from "expo-router";
import profileValidator from "@/src/utils/profileValidator";
import useChangePassword from "@/src/hooks/useChangePassword";
import { useTranslation } from "@/src/hooks/useTranslation";
import { colors } from "@/src/constants/colors";
import CustomButton from "./CustomButton";

const SettingsPassword = () => {
  const [showPassword, setShowPassword] = useState<boolean>(false);
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
    <View>
      <Text className="font-funnel-regular text-btc200 text-sm mb-1">
        {label}
      </Text>
      <View className="flex-row items-center bg-btc400 rounded-lg px-3">
        <TextInput
          value={value}
          multiline={false}
          maxLength={20}
          secureTextEntry={!showPassword}
          onChangeText={onChangeText}
          style={{
            height: 44,
            textAlignVertical: "center",
          }}
          className="flex-1 text-btc100 font-funnel-regular text-lg"
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <MaterialCommunityIcons
            name={showPassword ? "eye" : "eye-off"}
            size={20}
            color={colors.btc200}
          />
        </TouchableOpacity>
      </View>
    </View>
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
      <View className="bg-card rounded-xl p-4 gap-4">
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
        containerStyles="mt-4"
      />
    </View>
  );
};

export default SettingsPassword;
