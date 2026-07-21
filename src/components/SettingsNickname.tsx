import { useState, useCallback } from "react";
import { Alert, Text, TextInput, View, Keyboard } from "react-native";
import useUpdateNickname from "@/src/hooks/useUpdateNickname";
import { useAuth } from "@/src/context/AuthContext";
import { useFocusEffect } from "expo-router";
import { useTranslation } from "@/src/hooks/useTranslation";
import CustomButton from "./CustomButton";

const SettingsNickname = () => {
  const { authState } = useAuth();
  const currentNickname = authState?.user?.nickname;
  const [nickname, setNickname] = useState(currentNickname || "");
  const { updateNickname, isLoading } = useUpdateNickname();
  const { t } = useTranslation();

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
    Keyboard.dismiss();
    // Send to backend API
    const success = await updateNickname(nickname);
    if (success) {
      Alert.alert(t("settings.nickname.updatedSuccess"));
    } else {
      Alert.alert(t("settings.nickname.updateError"));
    }
  };

  return (
    <View>
      <View className="bg-card rounded-xl p-4">
        <TextInput
          value={nickname}
          maxLength={20}
          onChangeText={(text) => setNickname(text)}
          style={{
            height: 44,
            textAlignVertical: "center",
          }}
          className="text-btc100 font-funnel-regular text-xl bg-btc400 rounded-lg px-3"
        />
        <Text className="text-btc300 text-xs mt-2 text-right">
          {nickname.length}/20
        </Text>
      </View>
      <CustomButton
        title={t("common.save")}
        handlePress={handleOnPress}
        isLoading={isLoading}
        disabled={currentNickname === nickname || !nickname.trim()}
        containerStyles="mt-4"
      />
    </View>
  );
};

export default SettingsNickname;
