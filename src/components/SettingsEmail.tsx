import { useState, useCallback } from "react";
import { Text, TextInput, View, TouchableOpacity } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useFocusEffect } from "expo-router";
import profileValidator from "@/src/utils/profileValidator";
import useUpdateEmail from "@/src/hooks/useUpdateEmail";
import { useAuth } from "@/src/context/AuthContext";
import { useTranslation } from "@/src/hooks/useTranslation";
import { colors } from "@/src/constants/colors";
import CustomButton from "./CustomButton";

const SettingsEmail = () => {
  const { authState, setAuthState } = useAuth();
  const currentEmail = authState?.user?.email;
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [currentPassword, setCurrentPassword] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const { updateEmail, isLoading } = useUpdateEmail();
  const { checkEmailRegex } = profileValidator();
  const { t } = useTranslation();

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
      <View className="bg-card rounded-xl p-4 gap-4">
        <View>
          <Text className="font-funnel-regular text-btc200 text-sm mb-1">
            {t("settings.email.currentLabel")}
          </Text>
          <Text className="text-btc100 font-funnel-regular text-lg bg-btc400 rounded-lg px-3 py-3">
            {currentEmail}
          </Text>
        </View>

        <View>
          <Text className="font-funnel-regular text-btc200 text-sm mb-1">
            {t("settings.email.currentPasswordLabel")}
          </Text>
          <View className="flex-row items-center bg-btc400 rounded-lg px-3">
            <TextInput
              value={currentPassword}
              multiline={false}
              maxLength={20}
              secureTextEntry={!showPassword}
              onChangeText={(text) => setCurrentPassword(text)}
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

        <View>
          <Text className="font-funnel-regular text-btc200 text-sm mb-1">
            {t("settings.email.newLabel")}
          </Text>
          <TextInput
            value={email}
            multiline={false}
            maxLength={50}
            autoCapitalize="none"
            onChangeText={(text) => setEmail(text)}
            style={{
              height: 44,
              textAlignVertical: "center",
            }}
            className="text-btc100 font-funnel-regular text-lg bg-btc400 rounded-lg px-3"
          />
        </View>
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

export default SettingsEmail;
