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
import { useAuth } from "../context/AuthContext";
import { SafeAreaView } from "react-native-safe-area-context";
import Logo from "@/components/Logo";
import CustomButton from "@/components/CustomButton";
import CustomInput from "@/components/CustomInput";
import { Link } from "expo-router";

const Login = () => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const { onLogin } = useAuth();

  const onSubmit = async () => {
    if (username === "" || password === "") {
      Alert.alert("Please fill in all fields");
    } else {
      try {
        await onLogin(username, password);
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
    <SafeAreaView className="h-full bg-btc400">
      <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <View className="flex-1 items-center jusitfy-center p-4 mt-36">
              <Logo />
              {/* Username input */}
              <CustomInput
                title="Username"
                value={username}
                onChangeText={setUsername}
                containerStyles="w-3/5"
                isPassword={false}
              />

              {/* Password input */}
              <CustomInput
                title="Password"
                value={password}
                onChangeText={setPassword}
                containerStyles="w-3/5"
                isPassword={true}
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
              <View className="justify-center pt-8">
                <Link
                  href={"/screens/Signup" as any}
                  className="text-lg font-funnel-regular color-btc200"
                >
                  <Text className="text-lg font-funnel-regular color-btc200">
                    Signup here
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
