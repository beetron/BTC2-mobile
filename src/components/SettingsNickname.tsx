import { useState, useCallback } from "react";
import { Alert, Text, TextInput, View, Platform, Keyboard } from "react-native";
import useUpdateNickname from "@/src/hooks/useUpdateNickname";
import { useAuth } from "@/src/context/AuthContext";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useFocusEffect } from "expo-router";

const SettingsNickname = () => {
  const { authState } = useAuth();
  const currentNickname = authState?.user?.nickname;
  const [nickname, setNickname] = useState(currentNickname || "");
  const { updateNickname, isLoading } = useUpdateNickname();

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
    // Send to backend API
    const success = await updateNickname(nickname);
    if (success) {
      Alert.alert("Nickname updated");
    } else {
      Alert.alert("Error updating nickname");
    }
    Keyboard.dismiss();
  };

  return (
    <View className="flex-grow justify-center ml-4 mt-4 max-w-[80%]">
      <Text className="font-funnel-regular text-btc100 text-l">
        Display Name
      </Text>
      <TextInput
        value={nickname}
        maxLength={20}
        multiline={true}
        onChangeText={(text) => setNickname(text)}
        style={{
          height: 40,
          textAlignVertical: "center",
        }}
        className="text-btc100 font-funnel-regular text-2xl bg-btc400 border border-btc300 rounded px-2 max-w-[80%]"
      />
      <MaterialIcons
        name="save-as"
        size={26}
        color="white"
        className="absolute right-0 top-6"
        style={{ opacity: currentNickname === nickname ? 0.5 : 1 }}
        disabled={currentNickname === nickname || isLoading || !nickname.trim()}
        onPress={handleOnPress}
      />
      <Text className="absolute top-0 right-0 text-btc100 text-l opacity-[50%]">
        {nickname.length}/20
      </Text>
    </View>
  );
};

export default SettingsNickname;
