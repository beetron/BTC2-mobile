import { useState } from "react";
import { View, Text, Alert, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { useThemeColors } from "../../context/ThemeContext";
import AuthScreen from "../../components/AuthScreen";
import CustomButton from "../../components/CustomButton";
import CustomInput from "../../components/CustomInput";
import profileValidator from "@/src/utils/profileValidator";
import { useTranslation } from "../../hooks/useTranslation";
import { useTypeScale } from "../../hooks/useTypeScale";

interface FormData {
  email: string;
  username: string;
  password: string;
  passwordConfirm: string;
  uniqueId: string;
}

interface LoginData {
  username: string;
  password: string;
}

const Signup = () => {
  const {
    checkLengthUsername,
    checkLengthPassword,
    checkEmailRegex,
  } = profileValidator();
  const [formData, setFormData] = useState<FormData>({
    email: "",
    username: "",
    password: "",
    passwordConfirm: "",
    uniqueId: "",
  });

  const { onSignup, onLogin } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();
  const ts = useTypeScale();
  const colors = useThemeColors();

  const onSubmit = async () => {
    // Check if any fields are empty
    if (
      formData.email === "" ||
      formData.username === "" ||
      formData.password === "" ||
      formData.passwordConfirm === "" ||
      formData.uniqueId === ""
    ) {
      Alert.alert(t("auth.fillAllFieldsTitle"));
      return;
    }
    // Validate via utils/profileValidator.ts. No letters-and-numbers rule
    // on the password: the API accepts any characters, and the rule
    // rejected the strong password iOS suggests (e.g. abcdef-ghijkl-mnopqr)
    if (
      !checkLengthUsername(formData.username) ||
      !checkLengthPassword(formData.password) ||
      !checkEmailRegex(formData.email)
    ) {
      return;
    }

    // Check if passwords match
    else if (formData.password !== formData.passwordConfirm) {
      Alert.alert(t("auth.signup.passwordsMismatch"));
    } else {
      try {
        if (onSignup) {
          const result = await onSignup(
            formData.email,
            formData.username,
            formData.password,
            formData.uniqueId
          );

          // If signup & login was successful, redirect
          if (result && (result.status === 200 || result.status === 201)) {
            Alert.alert(
              t("auth.signup.successTitle"),
              t("auth.signup.successMessage"),
              [
                {
                  text: t("auth.signup.continueButton"),
                  onPress: () => {
                    setTimeout(async () => {
                      if (onLogin) {
                        await onLogin(formData.username, formData.password);
                      }
                    }, 500); // 500ms delay
                  },
                },
              ]
            );
          }
        }
      } catch (e) {
        // Only show alert if it's not a network error (network errors already alerted in AuthContext)
        if (e instanceof Error) {
          if (
            !e.message.includes("internet") &&
            !e.message.includes("timeout")
          ) {
            Alert.alert(t("auth.signup.failedTitle"), e.message);
          }
        }
      }
    }
  };

  return (
    <AuthScreen
      showBack
      title={t("auth.signup.title")}
      footer={
        <View className="flex-row flex-wrap justify-center items-center gap-x-1">
          <Text className={`${ts.body} text-inkMuted`}>
            {t("auth.signup.alreadyHaveAccount")}
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/guests/Login")}
            accessibilityRole="link"
            style={{ paddingVertical: 10, paddingHorizontal: 4 }}
          >
            <Text className={ts.bodyStrong} style={{ color: colors.primary }}>
              {t("auth.signup.loginHere")}
            </Text>
          </TouchableOpacity>
        </View>
      }
    >
      <CustomInput
        title={t("auth.signup.emailLabel")}
        value={formData.email}
        onChangeText={(e) => setFormData({ ...formData, email: e })}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
      />
      <CustomInput
        title={t("auth.signup.usernameLabel")}
        value={formData.username}
        onChangeText={(e) => setFormData({ ...formData, username: e })}
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="username-new"
      />
      <CustomInput
        title={t("auth.signup.passwordLabel")}
        value={formData.password}
        onChangeText={(e) => setFormData({ ...formData, password: e })}
        isPassword
        autoComplete="new-password"
        textContentType="newPassword"
      />
      <CustomInput
        title={t("auth.signup.confirmPasswordLabel")}
        value={formData.passwordConfirm}
        onChangeText={(e) => setFormData({ ...formData, passwordConfirm: e })}
        isPassword
        autoComplete="new-password"
        textContentType="newPassword"
      />
      <CustomInput
        title={t("auth.signup.friendIdLabel")}
        value={formData.uniqueId}
        onChangeText={(e) => setFormData({ ...formData, uniqueId: e })}
        autoCapitalize="none"
        autoCorrect={false}
      />

      <CustomButton
        title={t("auth.signup.signupButton")}
        containerStyles="mt-2"
        handlePress={onSubmit}
      />

      {/* EULA disclaimer -- inline pieces wrap together in either language */}
      <Text className={`${ts.label} text-inkMuted text-center px-4`}>
        {t("auth.signup.eulaPrefix")}
        <Text
          className={ts.label}
          style={{ color: colors.primary, textDecorationLine: "underline" }}
          onPress={() => router.push("./Eula")}
          accessibilityRole="link"
        >
          {t("auth.signup.eulaLink")}
        </Text>
        {t("auth.signup.eulaSuffix")}
      </Text>
    </AuthScreen>
  );
};

export default Signup;
