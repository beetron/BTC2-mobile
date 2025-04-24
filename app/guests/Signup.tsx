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
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useAuth } from "../../context/AuthContext";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomButton from "@/app/components/CustomButton";
import CustomInput from "@/app/components/CustomInput";
import { Link } from "expo-router";
import ProfileValidator from "@/utils/profileValidator";

interface FormData {
  username: string;
  password: string;
  passwordConfirm: string;
  uniqueId: string;
}

const Signup = () => {
  const { checkLength, checkAlphanumeric } = ProfileValidator();
  const [formData, setFormData] = useState<FormData>({
    username: "",
    password: "",
    passwordConfirm: "",
    uniqueId: "",
  });

  const { onSignup } = useAuth();
  const router = useRouter();

  const onSubmit = async () => {
    // Check if any fields are empty
    if (
      formData.username === "" ||
      formData.password === "" ||
      formData.passwordConfirm === "" ||
      formData.uniqueId === ""
    ) {
      Alert.alert("Please fill in all fields");
    }
    // Check if username is at least 6 characters long
    if (
      !checkLength(formData.username) ||
      !checkLength(formData.password) ||
      !checkAlphanumeric(formData.password)
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
            formData.username,
            formData.password,
            formData.uniqueId
          );

          // If signup & login was successful, redirect
          if (result && (result.status === 200 || result.status === 201)) {
            Alert.alert(
              "Signup Successful",
              "Please login with your new account",
              [
                {
                  text: "Continue",
                  onPress: () => {
                    console.log("Please login with your new account");
                    setTimeout(() => {
                      router.replace("/guests/Login");
                    }, 500); // 500ms delay
                  },
                },
              ]
            );
          }
        }
      } catch (e) {
        if (e instanceof Error) {
          Alert.alert("Signup failed", e.message);
        } else {
          Alert.alert("Signup failed", "An unknown error occurred");
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
              {/* <Logo /> */}
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
              <View className="justify-center pt-8 flex-row">
                <Text className="text-lg font-funnel-regular color-btc300 right-2">
                  Already have an account?
                </Text>
                <Link
                  href={"/guests/Login" as any}
                  className="text-lg font-funnel-regular color-btc200"
                >
                  <Text className="text-lg font-funnel-regular color-btc200">
                    Login here
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

export default Signup;
