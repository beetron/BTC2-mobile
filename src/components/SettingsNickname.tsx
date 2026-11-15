import { useState, useCallback } from "react";
import { Alert, View, Keyboard } from "react-native";
import useUpdateNickname from "@/src/hooks/useUpdateNickname";
import { useAuth } from "@/src/context/AuthContext";
import { useFocusEffect } from "expo-router";
import { useTranslation } from "@/src/hooks/useTranslation";
import CustomButton from "./CustomButton";
import CustomInput from "./CustomInput";

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
      <CustomInput
        title=""
        accessibilityLabel={t("settings.nickname.label")}
        value={nickname}
        maxLength={20}
        onChangeText={setNickname}
        helperText={`${nickname.length}/20`}
      />
      <CustomButton
        title={t("common.save")}
        handlePress={handleOnPress}
        isLoading={isLoading}
        disabled={currentNickname === nickname || !nickname.trim()}
        containerStyles="mt-6"
      />
    </View>
  );
};

export default SettingsNickname;
