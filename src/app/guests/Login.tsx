import { useRef, useState } from "react";
import { View, Text, Alert, TouchableOpacity } from "react-native";
import { useAuth } from "../../context/AuthContext";
import { useLocale } from "../../context/LocaleContext";
import { useThemeColors } from "../../context/ThemeContext";
import AuthScreen from "../../components/AuthScreen";
import CustomButton from "../../components/CustomButton";
import CustomInput from "../../components/CustomInput";
import { useRouter } from "expo-router";
import { useTranslation } from "../../hooks/useTranslation";
import { useTypeScale } from "../../hooks/useTypeScale";
import { serverErrorMessage } from "../../utils/serverError";

interface FormData {
  username: string;
  password: string;
}

const Login = () => {
  const [formData, setFormData] = useState<FormData>({
    username: "",
    password: "",
  });

  const { onLogin } = useAuth();
  const router = useRouter();
  const { t, locale } = useTranslation();
  const { setLocale } = useLocale();
  const colors = useThemeColors();
  const ts = useTypeScale();
  // A second tap while logging in sent a second login
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitting = useRef(false);

  const onSubmit = async () => {
    if (submitting.current) return;
    if (formData.username === "" || formData.password === "") {
      Alert.alert(t("auth.fillAllFieldsTitle"));
    } else {
      submitting.current = true;
      setIsSubmitting(true);
      try {
        if (onLogin) {
          await onLogin(formData.username, formData.password);
        }
      } catch (e) {
        if (e instanceof Error) {
          // Only show alert if it's not a network error (network errors already alerted in AuthContext)
          if (
            !e.message.includes("internet") &&
            !e.message.includes("timeout")
          ) {
            Alert.alert(
              t("auth.login.failedTitle"),
              serverErrorMessage(e.message, t, "errors.generic")
            );
          }
        }
      } finally {
        submitting.current = false;
        setIsSubmitting(false);
      }
    }
  };

  const languageToggle = (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel={t("settings.language.title")}
      className="flex-row p-1 rounded-full bg-surfaceMuted"
    >
      {(["en", "ja"] as const).map((code) => {
        const selected = locale === code;
        return (
          <TouchableOpacity
            key={code}
            onPress={() => setLocale(code)}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected }}
            style={{
              minHeight: 32,
              paddingHorizontal: 12,
              borderRadius: 16,
              justifyContent: "center",
              backgroundColor: selected ? colors.surface : "transparent",
            }}
          >
            <Text
              className={selected ? ts.bodyStrong : ts.body}
              style={{ color: selected ? colors.ink : colors.inkMuted, fontSize: 13 }}
            >
              {code === "en" ? "EN" : "日本語"}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  return (
    <AuthScreen
      // App name, not translated
      title="bTChatty2"
      topRight={languageToggle}
      footer={
        // flex-wrap: in Japanese the prompt + link can exceed one line
        <View className="flex-row flex-wrap justify-center items-center gap-x-1">
          <Text className={`${ts.body} text-inkMuted`}>{t("auth.login.needAccount")}</Text>
          <TouchableOpacity
            onPress={() => router.push("/guests/Signup")}
            accessibilityRole="link"
            style={{ paddingVertical: 10, paddingHorizontal: 4 }}
          >
            <Text className={ts.bodyStrong} style={{ color: colors.primary }}>
              {t("auth.login.signUpHere")}
            </Text>
          </TouchableOpacity>
        </View>
      }
    >
      <CustomInput
        title={t("auth.login.usernameLabel")}
        value={formData.username}
        onChangeText={(e) => setFormData({ ...formData, username: e })}
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="username"
        textContentType="username"
      />
      <CustomInput
        title={t("auth.login.passwordLabel")}
        value={formData.password}
        onChangeText={(e) => setFormData({ ...formData, password: e })}
        isPassword
        autoComplete="current-password"
        textContentType="password"
      />

      {/* Wraps onto two lines instead of overflowing: the two Japanese
          links together are wider than a phone screen. */}
      <View className="flex-row flex-wrap justify-between gap-y-1">
        <TouchableOpacity
          onPress={() => router.push("./ForgotUsername")}
          accessibilityRole="link"
          style={{ paddingVertical: 8 }}
        >
          <Text className={ts.bodyStrong} style={{ color: colors.primary }}>
            {t("auth.forgotPassword.forgotUsernameLink")}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push("./ForgotPassword")}
          accessibilityRole="link"
          style={{ paddingVertical: 8 }}
        >
          <Text className={ts.bodyStrong} style={{ color: colors.primary }}>
            {t("auth.login.forgotPasswordLink")}
          </Text>
        </TouchableOpacity>
      </View>

      <CustomButton
        title={t("auth.login.loginButton")}
        handlePress={onSubmit}
        containerStyles="mt-2"
        isLoading={isSubmitting}
      />
    </AuthScreen>
  );
};

export default Login;
