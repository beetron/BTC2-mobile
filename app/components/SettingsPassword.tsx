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
import profileValidator from "@/utils/profileValidator";
import useChangePassword from "@/hooks/useChangePassword";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";

const SettingsPassword = () => {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const { changePassword, isLoading } = useChangePassword();
  const { checkLength, checkPassword } = profileValidator();

  // Clear passwords when switching tabs
  useFocusEffect(
    useCallback(() => {
      setPassword("");
      setConfirmPassword("");
    }, [])
  );

  // Handle onPress
  const handleOnPress = async () => {
    // Validate data before sending to API
    if (!checkLength(password) || !checkPassword(password, confirmPassword))
      return;

    // Send to backend API
    const success = await changePassword(password);
    if (success) {
      setPassword("");
      setConfirmPassword("");
    }
  };

  return (
    <View className="justify-center" style={{ paddingTop: 50 }}>
      <View className="justify-center items-start">
        <Text className="font-funnel-regular text-btc100 text-2xl">
          Change Password
        </Text>
      </View>
      <View className="flex items-start pt-4">
        <Text className="font-funnel-regular text-btc100 text-l opacity-[50%]">
          Password
        </Text>
        <MaterialIcons
          name="save-as"
          size={26}
          color="white"
          className="absolute right-0 top-8"
          style={{ opacity: !password || !confirmPassword ? 0.5 : 1 }}
          disabled={!password || !confirmPassword || isLoading}
          onPress={handleOnPress}
        />
      </View>
      <View>
        <TextInput
          value={password}
          multiline={false}
          maxLength={20}
          secureTextEntry={!showPassword}
          onChangeText={(text) => setPassword(text)}
          style={{
            height: 40,
            paddingBottom: 0,
            paddingTop: Platform.OS === "ios" ? 14 : 0,
          }}
          className="text-btc100 font-funnel-regular text-2xl border-b border-btc300 max-w-[80%]"
        />
        <TouchableOpacity
          className="absolute right-20 top-0"
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
        <Text className="font-funnel-regular text-btc100 text-l opacity-[50%]">
          Confirm Password
        </Text>
      </View>
      <View>
        <TextInput
          value={confirmPassword}
          multiline={false}
          maxLength={20}
          secureTextEntry={!showPassword}
          onChangeText={(text) => setConfirmPassword(text)}
          style={{
            height: 40,
            paddingBottom: 0,
            paddingTop: Platform.OS === "ios" ? 14 : 0,
          }}
          className="text-btc100 font-funnel-regular text-2xl border-b border-btc300 max-w-[80%]"
        />
        <TouchableOpacity
          className="absolute right-20 top-0"
          onPress={() => setShowPassword(!showPassword)}
        >
          {showPassword ? (
            <FontAwesome5 name="eye" size={24} color="white" />
          ) : (
            <FontAwesome5 name="eye-slash" size={24} color="white" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SettingsPassword;
