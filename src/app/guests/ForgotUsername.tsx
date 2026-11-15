import { useState } from "react";
import { View, Text, Alert, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import AuthScreen from "../../components/AuthScreen";
import CustomButton from "../../components/CustomButton";
import CustomInput from "../../components/CustomInput";
import { useForgotUsername } from "../../hooks/useForgotUsername";
import profileValidator from "../../utils/profileValidator";
import { useTranslation } from "../../hooks/useTranslation";
import { useTypeScale } from "../../hooks/useTypeScale";
import { useThemeColors } from "../../context/ThemeContext";

interface FormData {
  email: string;
}

const ForgotUsername = () => {
  const [formData, setFormData] = useState<FormData>({
    email: "",
  });

  const router = useRouter();
  const { forgotUsername, isLoading } = useForgotUsername();
  const { checkEmailRegex } = profileValidator();
  const { t } = useTranslation();
  const ts = useTypeScale();
  const colors = useThemeColors();

  const onSubmit = async () => {
    if (formData.email === "") {
      Alert.alert(
        t("auth.forgotUsername.validationErrorTitle"),
        t("auth.forgotUsername.validationErrorMessage")
      );
      return;
    }

    // Validate email format
    if (!checkEmailRegex(formData.email)) {
      return;
    }

    const result = await forgotUsername(formData);

    if (result.success && result.message) {
      Alert.alert(t("common.success"), result.message, [
        {
          text: t("common.ok"),
          onPress: () => router.push("./Login"),
        },
      ]);
    } else if (result.error) {
      Alert.alert(t("common.error"), result.error);
    }
  };

  return (
    <AuthScreen
      showBack
      title={t("auth.forgotUsername.title")}
      subtitle={t("auth.forgotUsername.subtitle")}
      footer={
        <View className="items-center gap-1">
          <TouchableOpacity
            onPress={() => router.push("./Login")}
            accessibilityRole="link"
            style={{ paddingVertical: 8 }}
          >
            <Text className={`${ts.bodyStrong} text-center`} style={{ color: colors.primary }}>
              {t("auth.forgotUsername.backToLogin")}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push("./ForgotPassword")}
            accessibilityRole="link"
            style={{ paddingVertical: 8 }}
          >
            <Text className={`${ts.bodyStrong} text-center`} style={{ color: colors.primary }}>
              {t("auth.forgotUsername.forgotPasswordLink")}
            </Text>
          </TouchableOpacity>
        </View>
      }
    >
      <CustomInput
        title={t("auth.forgotUsername.emailLabel")}
        value={formData.email}
        onChangeText={(e) => setFormData({ ...formData, email: e })}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
      />
      <CustomButton
        title={t("auth.forgotUsername.sendButton")}
        isLoading={isLoading}
        containerStyles="mt-2"
        handlePress={onSubmit}
      />
    </AuthScreen>
  );
};

export default ForgotUsername;
