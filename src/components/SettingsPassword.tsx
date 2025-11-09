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
import useChangePassword from "@/src/hooks/useChangePassword";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";

const SettingsPassword = () => {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [currentPassword, setCurrentPassword] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const { changePassword, isLoading } = useChangePassword();
  const { checkLengthPassword, checkPassword } = profileValidator();

  // Clear passwords when switching tabs
  useFocusEffect(
    useCallback(() => {
      setCurrentPassword("");
      setPassword("");
      setConfirmPassword("");
    }, [])
  );

  // Handle onPress
  const handleOnPress = async () => {
    // Validate data before sending to API
    if (
      !currentPassword ||
      !checkLengthPassword(password) ||
      !checkPassword(password, confirmPassword)
    )
      return;

    // Send to backend API
    const success = await changePassword(currentPassword, password);
    if (success) {
      setCurrentPassword("");
      setPassword("");
      setConfirmPassword("");
    }
  };

  return (
    <View className="justify-center" style={{ paddingTop: 30 }}>
      <View className="justify-center items-start">
        <Text className="font-funnel-regular text-btc100 text-2xl">
          Change Password
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
          style={{
            opacity:
              !currentPassword || !password || !confirmPassword ? 0.5 : 1,
          }}
          disabled={
            !currentPassword || !password || !confirmPassword || isLoading
          }
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
        <Text className="font-funnel-regular text-btc100 text-l">Password</Text>
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
        <Text className="font-funnel-regular text-btc100 text-l">
          Confirm Password
        </Text>
      </View>
      <View className="mb-8">
        <TextInput
          value={confirmPassword}
          multiline={false}
          maxLength={20}
          secureTextEntry={!showPassword}
          onChangeText={(text) => setConfirmPassword(text)}
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
    </View>
  );
};

export default SettingsPassword;
