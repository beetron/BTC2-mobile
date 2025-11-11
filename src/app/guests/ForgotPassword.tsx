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
import { Link, useRouter } from "expo-router";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import Logo from "../../components/Logo";
import CustomButton from "../../components/CustomButton";
import CustomInput from "../../components/CustomInput";
import { useForgotPassword } from "../../hooks/useForgotPassword";
import profileValidator from "../../utils/profileValidator";

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

  const onSubmit = async () => {
    if (formData.username === "" || formData.email === "") {
      Alert.alert("Validation Error", "Please fill in all fields");
      return;
    }

    // Validate email format
    if (!checkEmailRegex(formData.email)) {
      return;
    }

    const result = await forgotPassword(formData);

    if (result.success && result.message) {
      Alert.alert("Success", result.message, [
        {
          text: "OK",
          onPress: () => router.push("./Login"),
        },
      ]);
    } else if (result.error) {
      Alert.alert("Error", result.error);
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
              Matching username and email required for password reset.
            </Text>

            {/* Username input */}
            <CustomInput
              title="Username"
              value={formData.username}
              onChangeText={(e) => setFormData({ ...formData, username: e })}
              containerStyles="w-3/5"
              isPassword={false}
              autoCompleteType="username"
            />

            {/* Email input */}
            <CustomInput
              title="Email"
              value={formData.email}
              onChangeText={(e) => setFormData({ ...formData, email: e })}
              containerStyles="w-3/5"
              isPassword={false}
              autoCompleteType="email"
              keyboardType="email-address"
            />

            {/* Submit button */}
            <CustomButton
              title="Reset Password"
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
                Back to Login
              </Text>
            </TouchableOpacity>

            {/* Forgot Username link */}
            <TouchableOpacity
              onPress={() => router.push("./ForgotUsername")}
              className="top-10"
            >
              <Text className="text-lg font-funnel-regular color-btc200 p-2">
                Forgot Username?
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ForgotPassword;
