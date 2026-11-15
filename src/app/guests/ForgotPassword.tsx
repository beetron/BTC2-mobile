import { useState } from "react";
import { View, Text, Alert, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import AuthScreen from "../../components/AuthScreen";
import CustomButton from "../../components/CustomButton";
import CustomInput from "../../components/CustomInput";
import { useForgotPassword } from "../../hooks/useForgotPassword";
import profileValidator from "../../utils/profileValidator";
import { useTranslation } from "../../hooks/useTranslation";
import { useTypeScale } from "../../hooks/useTypeScale";
import { useThemeColors } from "../../context/ThemeContext";

interface FormData {
  username: string;
  email: string;
}

const ForgotPassword = () => {
  const [formData, setFormData] = useState<FormData>({
    username: "",
    email: "",
  });

  const router = useRouter();
  const { forgotPassword, isLoading } = useForgotPassword();
  const { checkEmailRegex } = profileValidator();
  const { t } = useTranslation();
  const ts = useTypeScale();
  const colors = useThemeColors();

  const onSubmit = async () => {
    if (formData.username === "" || formData.email === "") {
      Alert.alert(
        t("auth.forgotPassword.validationErrorTitle"),
        t("auth.forgotPassword.validationErrorMessage")
      );
      return;
    }

    // Validate email format
    if (!checkEmailRegex(formData.email)) {
      return;
    }

    const result = await forgotPassword(formData);

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
      title={t("auth.forgotPassword.resetButton")}
      subtitle={t("auth.forgotPassword.subtitle")}
      footer={
        <View className="items-center gap-1">
          <TouchableOpacity
            onPress={() => router.push("./Login")}
            accessibilityRole="link"
            style={{ paddingVertical: 8 }}
          >
            <Text className={`${ts.bodyStrong} text-center`} style={{ color: colors.primary }}>
              {t("auth.forgotPassword.backToLogin")}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push("./ForgotUsername")}
            accessibilityRole="link"
            style={{ paddingVertical: 8 }}
          >
            <Text className={`${ts.bodyStrong} text-center`} style={{ color: colors.primary }}>
              {t("auth.forgotPassword.forgotUsernameLink")}
            </Text>
          </TouchableOpacity>
        </View>
      }
    >
      <CustomInput
        title={t("auth.forgotPassword.usernameLabel")}
        value={formData.username}
        onChangeText={(e) => setFormData({ ...formData, username: e })}
        autoCapitalize="none"
        autoComplete="username"
      />
      <CustomInput
        title={t("auth.forgotPassword.emailLabel")}
        value={formData.email}
        onChangeText={(e) => setFormData({ ...formData, email: e })}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
      />
      <CustomButton
        title={t("auth.forgotPassword.resetButton")}
        isLoading={isLoading}
        containerStyles="mt-2"
        handlePress={onSubmit}
      />
    </AuthScreen>
  );
};

export default ForgotPassword;
