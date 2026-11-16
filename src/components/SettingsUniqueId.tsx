import { useState, useCallback } from "react";
import { View, Keyboard } from "react-native";
import useUpdateUniqueId from "@/src/hooks/useUpdateUniqueId";
import { useAuth } from "@/src/context/AuthContext";
import { useFocusEffect } from "expo-router";
import profileValidator from "@/src/utils/profileValidator";
import { useTranslation } from "@/src/hooks/useTranslation";
import CustomButton from "./CustomButton";
import CustomInput from "./CustomInput";

const SettingsUniqueId = () => {
  const { authState } = useAuth();
  const currentUniqueId = authState?.user?.uniqueId;
  const [uniqueId, setUniqueId] = useState(currentUniqueId || "");
  const { updateUniqueId, isLoading } = useUpdateUniqueId();
  const { t } = useTranslation();
  const { checkLengthUsername, checkAlphanumeric } = profileValidator(t);

  // Reset current unique ID when switching tabs
  useFocusEffect(
    useCallback(() => {
      if (currentUniqueId) {
        setUniqueId(currentUniqueId);
      }
    }, [currentUniqueId])
  );

  // Handle onPress
  const handleOnPress = async () => {
    // Validate data before sending to API
    if (!checkLengthUsername(uniqueId) || !checkAlphanumeric(uniqueId)) return;

    Keyboard.dismiss();
    // Send to backend API
    await updateUniqueId(uniqueId);
  };

  // Pure format check for the Save button's enabled state -- must not call
  // checkLengthUsername/checkAlphanumeric here, they Alert.alert() on
  // failure and this runs on every render (every keystroke).
  const isValidFormat =
    uniqueId.length >= 6 &&
    uniqueId.length <= 20 &&
    /^[a-zA-Z0-9]+$/.test(uniqueId);

  return (
    <View>
      <CustomInput
        title={t("settings.uniqueId.label")}
        value={uniqueId}
        maxLength={20}
        autoCapitalize="none"
        autoCorrect={false}
        onChangeText={(text) => setUniqueId(text.toLowerCase())}
        helperText={`${uniqueId.length}/20`}
      />
      <CustomButton
        title={t("common.save")}
        handlePress={handleOnPress}
        isLoading={isLoading}
        disabled={currentUniqueId === uniqueId || !isValidFormat}
        containerStyles="mt-6"
      />
    </View>
  );
};

export default SettingsUniqueId;
