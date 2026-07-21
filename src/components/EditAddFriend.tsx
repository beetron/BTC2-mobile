import { View, Text, TextInput, Platform, Alert, Keyboard } from "react-native";
import { useState, useCallback } from "react";
import useAddFriend from "@/src/hooks/useAddFriend";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useFocusEffect } from "expo-router";
import { useTranslation } from "../hooks/useTranslation";

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
    const success = await addFriend(friendUniqueId);
    if (success) {
      setFriendUniqueId("");
      Keyboard.dismiss();
    }
  };

  return (
    <View className="bg-btc500">
      <View className="flex-row items-center">
        <Text className="text-btc100 font-funnel-regular text-2xl items-start">
          {t("friends.addFriend.title")}
        </Text>
      </View>
      <View className="mt-2">
        <TextInput
          value={friendUniqueId}
          placeholder={t("friends.addFriend.placeholder")}
          placeholderTextColor="grey"
          autoCapitalize="none"
          maxLength={20}
          multiline={true}
          onChangeText={(text) => setFriendUniqueId(text)}
          style={{
            height: 40,
            paddingBottom: 0,
            paddingTop: Platform.OS === "ios" ? 14 : 0,
          }}
          className="text-btc100 font-funnel-regular text-2xl border-b border-btc300 max-w-[80%]"
        />
        <Text className="absolute top-0 right-16 text-btc100 text-l opacity-[50%]">
          {friendUniqueId.length}/20
        </Text>
        <AntDesign
          name="user-add"
          size={34}
          color="white"
          className="absolute right-0 top-2"
          disabled={loading}
          onPress={handleOnPress}
        />
      </View>
    </View>
  );
};

export default EditAddFriend;
