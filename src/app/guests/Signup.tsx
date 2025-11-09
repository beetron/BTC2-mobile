import { useState } from "react";
import {
  View,
  Text,
  Keyboard,
  TouchableWithoutFeedback,
  Alert,
  TouchableOpacity,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useAuth } from "../../context/AuthContext";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomButton from "../../components/CustomButton";
import CustomInput from "../../components/CustomInput";
// removed unused Link import; using router.push with TouchableOpacity instead
import profileValidator from "@/src/utils/profileValidator";

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
    checkAlphanumeric,
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

  const onSubmit = async () => {
    // Check if any fields are empty
    if (
      formData.email === "" ||
      formData.username === "" ||
      formData.password === "" ||
      formData.passwordConfirm === "" ||
      formData.uniqueId === ""
    ) {
      Alert.alert("Please fill in all fields");
    }
    // Validate via utils/profileValidator.ts
    if (
      !checkLengthUsername(formData.username) ||
      !checkLengthPassword(formData.password) ||
      !checkAlphanumeric(formData.password) ||
      !checkEmailRegex(formData.email)
    ) {
      return;
    }

    // Check if passwords match
    else if (formData.password !== formData.passwordConfirm) {
      Alert.alert("Passwords do not match");
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
              "Signup Successful",
              "Logging in with your new account...",
              [
                {
                  text: "Continue",
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
            Alert.alert("Signup failed", e.message);
          }
        }
      }
    }
  };

  return (
    <SafeAreaView className="h-full bg-btc500">
      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: 24,
          paddingBottom: 24,
        }}
        bottomOffset={100}
        extraKeyboardSpace={20}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View className="flex-1 p-4 items-center justify-start pt-20">
            {/* <Logo /> */}
            {/* Email input */}
            <CustomInput
              title="Email"
              value={formData.email}
              onChangeText={(e) => setFormData({ ...formData, email: e })}
              containerStyles="w-3/5"
              isPassword={false}
            />
            {/* Username input */}
            <CustomInput
              title="Username"
              value={formData.username}
              onChangeText={(e) => setFormData({ ...formData, username: e })}
              containerStyles="w-3/5"
              isPassword={false}
            />

            {/* Password input */}
            <CustomInput
              title="Password"
              value={formData.password}
              onChangeText={(e) => setFormData({ ...formData, password: e })}
              containerStyles="w-3/5"
              isPassword={true}
            />
            {/* Password Confirmation input */}
            <CustomInput
              title="Confirm Password"
              value={formData.passwordConfirm}
              onChangeText={(e) =>
                setFormData({ ...formData, passwordConfirm: e })
              }
              containerStyles="w-3/5"
              isPassword={true}
            />
            {/* Friend's uniqueId */}
            <CustomInput
              title="Friend's ID"
              value={formData.uniqueId}
              onChangeText={(e) => setFormData({ ...formData, uniqueId: e })}
              containerStyles="w-3/5"
              isPassword={false}
            />

            {/* Signup button */}
            <CustomButton
              title="Signup"
              isLoading={false}
              textStyles="font-funnel-regular"
              containerStyles="w-3/5 top-5"
              handlePress={onSubmit}
            />
            {/* Link to Login screen */}
            <View className="justify-center items-center pt-8 flex-row mt-4">
              <Text className="text-lg font-funnel-regular color-btc300 right-2">
                Already have an account?
              </Text>
              <TouchableOpacity
                style={{ padding: 8, backgroundColor: "transparent" }}
                onPress={() => router.push("/guests/Login")}
              >
                <Text className="text-lg font-funnel-regular color-btc200">
                  Login here
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAwareScrollView>
      <StatusBar style="light" />
    </SafeAreaView>
  );
};

export default Signup;
