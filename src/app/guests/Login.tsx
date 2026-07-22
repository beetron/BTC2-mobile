import { useState } from "react";
import {
  View,
  Text,
  Keyboard,
  TouchableWithoutFeedback,
  Alert,
  TouchableOpacity,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useAuth } from "../../context/AuthContext";
import { SafeAreaView } from "react-native-safe-area-context";
import Logo from "../../components/Logo";
import CustomButton from "../../components/CustomButton";
import CustomInput from "../../components/CustomInput";
import { useRouter } from "expo-router";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useTranslation } from "../../hooks/useTranslation";

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
  // Noto Sans JP renders visibly larger than Funnel Display at the same
  // nominal size, so Japanese uses one step down here.
  const linkTextSize = locale === "ja" ? "text-base" : "text-lg";

  const onSubmit = async () => {
    if (formData.username === "" || formData.password === "") {
      Alert.alert(t("auth.fillAllFieldsTitle"));
    } else {
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
            Alert.alert(t("auth.login.failedTitle"), e.message);
          }
        }
      }
    }
  };

  return (
    <SafeAreaView className="h-full bg-btc500">
      <KeyboardAvoidingView
        behavior="padding"
        keyboardVerticalOffset={100}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View
            style={{
              flex: 1,
              padding: 16,
              justifyContent: "center",
              alignItems: "center",
              marginTop: 40,
            }}
          >
            <Logo />
            {/* Username input */}
            <CustomInput
              title={t("auth.login.usernameLabel")}
              value={formData.username}
              onChangeText={(e) => setFormData({ ...formData, username: e })}
              containerStyles="w-3/5"
              isPassword={false}
              autoCompleteType="username"
            />

            {/* Password input */}
            <CustomInput
              title={t("auth.login.passwordLabel")}
              value={formData.password}
              onChangeText={(e) => setFormData({ ...formData, password: e })}
              containerStyles="w-3/5"
              isPassword={true}
              autoComleteType="password"
            />

            {/* Forgot Password link */}
            <View className="w-3/5 justify-end flex-row mt-4">
              <TouchableOpacity onPress={() => router.push("./ForgotPassword")}>
                <Text className={`${linkTextSize} font-funnel-regular color-btc200`}>
                  {t("auth.login.forgotPasswordLink")}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Login button */}
            <CustomButton
              title={t("auth.login.loginButton")}
              isLoading={false}
              textStyles="font-funnel-regular"
              containerStyles="w-3/5 top-5"
              handlePress={onSubmit}
            />
            {/* Signup */}
            <View className="justify-center items-center pt-8 flex-row mt-4">
              <Text className={`${linkTextSize} font-funnel-regular color-btc300 right-2`}>
                {t("auth.login.needAccount")}
              </Text>
              <TouchableOpacity
                style={{ padding: 8, backgroundColor: "transparent" }}
                onPress={() => router.push("/guests/Signup")}
              >
                <Text className={`${linkTextSize} font-funnel-regular color-btc200`}>
                  {t("auth.login.signUpHere")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
      <StatusBar style="light" />
    </SafeAreaView>
  );
};

export default Login;
