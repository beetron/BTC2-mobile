import { useState, useCallback } from "react";
import { Alert, Text, TextInput, View, Platform } from "react-native";
import useUpdateNickname from "@/hooks/useUpdateNickname";
import { useAuth } from "@/context/AuthContext";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useFocusEffect } from "expo-router";
import ProfileValidator from "@/utils/profileValidator";

const SettingsNickname = () => {
  const { authState } = useAuth();
  const currentNickname = authState?.user?.nickname;
  const [nickname, setNickname] = useState(currentNickname || "");
  const { updateNickname, isLoading } = useUpdateNickname();
  const { checkLength } = ProfileValidator();

  // Reset current nickname when switching tabs
  useFocusEffect(
    useCallback(() => {
      if (currentNickname) {
        setNickname(currentNickname);
      }
    }, [currentNickname])
  );

  // Handle onPress
  const handleOnPress = async () => {
    // Validate data before sending to API
    const isLengthValid = checkLength(nickname);
    if (!isLengthValid) return;

    // Send to backend API
    const success = await updateNickname(nickname);
    if (success) {
      Alert.alert("Nickname updated");
    } else {
      Alert.alert("Error updating nickname");
    }
  };

  return (
    <View className="flex-grow justify-center ml-4 max-w-[80%]">
      <Text className="font-funnel-regular text-btc100 text-l opacity-[50%]">
        Display Name
      </Text>
      <TextInput
        value={nickname}
        maxLength={20}
        multiline={true}
        onChangeText={(text) => setNickname(text)}
        style={{
          height: 40,
          paddingBottom: 0,
          paddingTop: Platform.OS === "ios" ? 14 : 0,
        }}
        className="text-btc100 font-funnel-regular text-2xl border-b border-btc300"
      />
      <MaterialIcons
        name="save-as"
        size={26}
        color="white"
        className="absolute right-0 top-6"
        style={{ opacity: currentNickname === nickname ? 0.5 : 1 }}
        disabled={currentNickname === nickname || isLoading}
        onPress={handleOnPress}
      />
      <Text className="absolute top-0 right-0 text-btc100 text-l opacity-[50%]">
        {nickname.length}/20
      </Text>
    </View>
  );
};

export default SettingsNickname;
