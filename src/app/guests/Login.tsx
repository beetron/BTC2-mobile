import { useState, useEffect } from "react";
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
import * as SecureStore from "expo-secure-store";

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

  useEffect(() => {
    const checkEulaAcceptance = async () => {
      try {
        const eulaAccepted = await SecureStore.getItemAsync("eulaAccepted");
        if (!eulaAccepted || eulaAccepted !== "true") {
          router.replace("./Eula");
        }
      } catch (error) {
        // If SecureStore fails, show EULA for safety
        router.replace("./Eula");
      }
    };

    checkEulaAcceptance();
  }, [router]);
  const onSubmit = async () => {
    if (formData.username === "" || formData.password === "") {
      Alert.alert("Please fill in all fields");
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
            Alert.alert("Login failed", e.message);
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
              title="Username"
              value={formData.username}
              onChangeText={(e) => setFormData({ ...formData, username: e })}
              containerStyles="w-3/5"
              isPassword={false}
              autoCompleteType="username"
            />

            {/* Password input */}
            <CustomInput
              title="Password"
              value={formData.password}
              onChangeText={(e) => setFormData({ ...formData, password: e })}
              containerStyles="w-3/5"
              isPassword={true}
              autoComleteType="password"
            />

            {/* Forgot Password link */}
            <View className="w-3/5 justify-end flex-row mt-4">
              <TouchableOpacity onPress={() => router.push("./ForgotPassword")}>
                <Text className="text-lg font-funnel-regular color-btc200">
                  Forgot Password?
                </Text>
              </TouchableOpacity>
            </View>

            {/* Login button */}
            <CustomButton
              title="Login"
              isLoading={false}
              textStyles="font-funnel-regular"
              containerStyles="w-3/5 top-5"
              handlePress={onSubmit}
            />
            {/* Signup */}
            <View className="justify-center items-center pt-8 flex-row mt-4">
              <Text className="text-lg font-funnel-regular color-btc300 right-2">
                Need an account?
              </Text>
              <TouchableOpacity
                style={{ padding: 8, backgroundColor: "transparent" }}
                onPress={() => router.push("/guests/Signup")}
              >
                <Text className="text-lg font-funnel-regular color-btc200">
                  Sign up here
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
