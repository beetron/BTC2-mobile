import { useState } from "react";
import {
  View,
  Text,
  Keyboard,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  ScrollView,
  Alert,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useAuth } from "../../context/AuthContext";
import { SafeAreaView } from "react-native-safe-area-context";
import Logo from "../components/Logo";
import CustomButton from "@/app/components/CustomButton";
import CustomInput from "@/app/components/CustomInput";
import { Link } from "expo-router";

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
          Alert.alert("Login failed", e.message);
        } else {
          Alert.alert("Login failed", "An unknown error occurred");
        }
      }
    }
  };

  return (
    <SafeAreaView className="h-full bg-btc500">
      <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <View className="flex-1 items-center jusitfy-center p-4 mt-24">
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

              {/* Login button */}
              <CustomButton
                title="Login"
                isLoading={false}
                textStyles="font-funnel-regular"
                containerStyles="w-3/5 top-5"
                handlePress={onSubmit}
              />
              {/* Signup */}
              <View className="justify-center pt-8 flex-row">
                <Text className="text-lg font-funnel-regular color-btc300 right-2">
                  Need an account?
                </Text>
                <Link
                  href={"/guests/Signup" as any}
                  className="text-lg font-funnel-regular color-btc200"
                >
                  <Text className="text-lg font-funnel-regular color-btc200">
                    Sign up here
                  </Text>
                </Link>
              </View>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
      <StatusBar style="light" />
    </SafeAreaView>
  );
};

export default Login;
