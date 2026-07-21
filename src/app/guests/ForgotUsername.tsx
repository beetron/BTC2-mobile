import { useState } from "react";
import {
  View,
  Text,
  Keyboard,
  TouchableWithoutFeedback,
  Alert,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import Logo from "../../components/Logo";
import CustomButton from "../../components/CustomButton";
import CustomInput from "../../components/CustomInput";
import { useForgotUsername } from "../../hooks/useForgotUsername";
import profileValidator from "../../utils/profileValidator";
import { useTranslation } from "../../hooks/useTranslation";

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

            {/* Subtitle */}
            <Text className="text-btc100 text-center mb-6 px-4">
              {t("auth.forgotUsername.subtitle")}
            </Text>

            {/* Email input */}
            <CustomInput
              title={t("auth.forgotUsername.emailLabel")}
              value={formData.email}
              onChangeText={(e) => setFormData({ ...formData, email: e })}
              containerStyles="w-3/5"
              isPassword={false}
              autoCompleteType="email"
              keyboardType="email-address"
            />

            {/* Submit button */}
            <CustomButton
              title={t("auth.forgotUsername.sendButton")}
              isLoading={isLoading}
              textStyles="font-funnel-regular"
              containerStyles="w-3/5 top-5"
              handlePress={onSubmit}
            />

            {/* Back to Login */}
            <TouchableOpacity
              onPress={() => router.push("./Login")}
              className="top-8"
            >
              <Text className="text-lg font-funnel-regular color-btc200 p-2">
                {t("auth.forgotUsername.backToLogin")}
              </Text>
            </TouchableOpacity>

            {/* Forgot Password link */}
            <TouchableOpacity
              onPress={() => router.push("./ForgotPassword")}
              className="top-10"
            >
              <Text className="text-lg font-funnel-regular color-btc200 p-2">
                {t("auth.forgotUsername.forgotPasswordLink")}
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ForgotUsername;
