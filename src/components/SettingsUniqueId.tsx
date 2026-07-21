import { useState, useCallback } from "react";
import { Text, TextInput, View, Keyboard } from "react-native";
import useUpdateUniqueId from "@/src/hooks/useUpdateUniqueId";
import { useAuth } from "@/src/context/AuthContext";
import { useFocusEffect } from "expo-router";
import profileValidator from "@/src/utils/profileValidator";
import { useTranslation } from "@/src/hooks/useTranslation";
import CustomButton from "./CustomButton";

const SettingsUniqueId = () => {
  const { authState } = useAuth();
  const currentUniqueId = authState?.user?.uniqueId;
  const [uniqueId, setUniqueId] = useState(currentUniqueId || "");
  const { updateUniqueId, isLoading } = useUpdateUniqueId();
  const { checkLengthUsername, checkAlphanumeric } = profileValidator();
  const { t } = useTranslation();

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
      <View className="bg-card rounded-xl p-4">
        <Text className="font-funnel-regular text-btc300 text-sm mb-2">
          {t("settings.uniqueId.label")}
        </Text>
        <TextInput
          value={uniqueId}
          maxLength={20}
          autoCapitalize="none"
          onChangeText={(text) => setUniqueId(text.toLowerCase())}
          style={{
            height: 44,
            textAlignVertical: "center",
          }}
          className="text-btc100 font-funnel-regular text-xl bg-btc400 rounded-lg px-3"
        />
        <Text className="text-btc300 text-xs mt-2 text-right">
          {uniqueId.length}/20
        </Text>
      </View>
      <CustomButton
        title={t("common.save")}
        handlePress={handleOnPress}
        isLoading={isLoading}
        disabled={currentUniqueId === uniqueId || !isValidFormat}
        containerStyles="mt-4"
      />
    </View>
  );
};

export default SettingsUniqueId;
