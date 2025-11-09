import { useState, useCallback } from "react";
import {
  Alert,
  Text,
  TextInput,
  View,
  Platform,
  TouchableOpacity,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useFocusEffect } from "expo-router";
import profileValidator from "@/src/utils/profileValidator";
import useUpdateEmail from "@/src/hooks/useUpdateEmail";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { useAuth } from "@/src/context/AuthContext";

const SettingsEmail = () => {
  const { authState, setAuthState } = useAuth();
  const currentEmail = authState?.user?.email;
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [currentPassword, setCurrentPassword] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const { updateEmail, isLoading } = useUpdateEmail();
  const { checkEmailRegex } = profileValidator();

  // Clear fields when switching tabs
  useFocusEffect(
    useCallback(() => {
      setCurrentPassword("");
      setEmail("");
    }, [])
  );

  // Handle onPress
  const handleOnPress = async () => {
    // Validate data before sending to API
    if (!currentPassword || !checkEmailRegex(email)) return;

    // Send to backend API
    const success = await updateEmail(email, currentPassword);
    if (success) {
      if (setAuthState) {
        setAuthState((prev) => ({
          ...prev,
          user: prev.user ? { ...prev.user, email } : null,
        }));
      }
      setCurrentPassword("");
      setEmail("");
    }
  };

  return (
    <View className="justify-center" style={{ paddingTop: 30 }}>
      <View className="justify-center items-start">
        <Text className="font-funnel-regular text-btc100 text-2xl">
          Update Email
        </Text>
      </View>
      <View className="flex-grow justify-center max-w-[80%] mt-4">
        <Text className="font-funnel-regular text-btc100 text-l opacity-[80%]">
          Current Email
        </Text>
        <Text
          style={{
            height: 40,
            textAlignVertical: "center",
          }}
          className="text-btc100 font-funnel-regular text-2xl"
        >
          {currentEmail}
        </Text>
      </View>
      <View className="flex items-start pt-4">
        <Text className="font-funnel-regular text-btc100 text-l">
          Current Password
        </Text>
        <MaterialIcons
          name="save-as"
          size={26}
          color="white"
          className="absolute right-0 top-8"
          style={{ opacity: !currentPassword || !email ? 0.5 : 1 }}
          disabled={!currentPassword || !email || isLoading}
          onPress={handleOnPress}
        />
      </View>
      <View>
        <TextInput
          value={currentPassword}
          multiline={false}
          maxLength={20}
          secureTextEntry={!showPassword}
          onChangeText={(text) => setCurrentPassword(text)}
          style={{
            height: 40,
            textAlignVertical: "center",
          }}
          className="text-btc100 font-funnel-regular text-2xl bg-btc400 rounded px-2 max-w-[80%]"
        />
        <TouchableOpacity
          className="absolute right-20 top-2"
          onPress={() => setShowPassword(!showPassword)}
        >
          {showPassword ? (
            <FontAwesome5 name="eye" size={24} color="white" />
          ) : (
            <FontAwesome5 name="eye-slash" size={24} color="white" />
          )}
        </TouchableOpacity>
      </View>
      <View className="flex items-start pt-4">
        <Text className="font-funnel-regular text-btc100 text-l">Email</Text>
      </View>
      <View className="mb-8">
        <TextInput
          value={email}
          multiline={false}
          maxLength={50}
          autoCapitalize="none"
          onChangeText={(text) => setEmail(text)}
          style={{
            height: 40,
            textAlignVertical: "center",
          }}
          className="text-btc100 font-funnel-regular text-2xl bg-btc400 rounded px-2 max-w-[80%]"
        />
      </View>
    </View>
  );
};

export default SettingsEmail;
