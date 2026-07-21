import { View, Text, TextInput, Alert, Keyboard } from "react-native";
import { useState, useCallback } from "react";
import useAddFriend from "@/src/hooks/useAddFriend";
import { useFocusEffect } from "expo-router";
import { useTranslation } from "../hooks/useTranslation";
import { colors } from "../constants/colors";
import CustomButton from "./CustomButton";

const EditAddFriend = () => {
  const [friendUniqueId, setFriendUniqueId] = useState("");
  const { addFriend, loading } = useAddFriend();
  const { t } = useTranslation();

  // Reset text input when switching tabs
  useFocusEffect(
    useCallback(() => {
      setFriendUniqueId("");
    }, [])
  );

  // Handle onPress
  const handleOnPress = async () => {
    if (!friendUniqueId) {
      Alert.alert(t("friends.addFriend.missingIdTitle"));
      return;
    }
    Keyboard.dismiss();
    const success = await addFriend(friendUniqueId);
    if (success) {
      setFriendUniqueId("");
    }
  };

  return (
    <View>
      <View className="bg-card rounded-xl p-4">
        <TextInput
          value={friendUniqueId}
          placeholder={t("friends.addFriend.placeholder")}
          placeholderTextColor={colors.btc300}
          autoCapitalize="none"
          maxLength={20}
          onChangeText={(text) => setFriendUniqueId(text)}
          style={{
            height: 44,
            textAlignVertical: "center",
          }}
          className="text-btc100 font-funnel-regular text-xl bg-btc400 rounded-lg px-3"
        />
        <Text className="text-btc300 text-xs mt-2 text-right">
          {friendUniqueId.length}/20
        </Text>
      </View>
      <CustomButton
        title={t("common.add")}
        handlePress={handleOnPress}
        isLoading={loading}
        disabled={!friendUniqueId.trim()}
        containerStyles="mt-4"
      />
    </View>
  );
};

export default EditAddFriend;
