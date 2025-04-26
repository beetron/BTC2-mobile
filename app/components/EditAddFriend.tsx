import { View, Text, TextInput, Platform, Alert } from "react-native";
import { useState, useCallback } from "react";
import useAddFriend from "@/hooks/useAddFriend";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useFocusEffect } from "expo-router";

const EditAddFriend = () => {
  const [friendUniqueId, setFriendUniqueId] = useState("");
  const { addFriend, loading } = useAddFriend();

  // Reset text input when switching tabs
  useFocusEffect(
    useCallback(() => {
      setFriendUniqueId("");
    }, [])
  );

  // Handle onPress
  const handleOnPress = async () => {
    if (!friendUniqueId) {
      Alert.alert("Missing Unique ID");
      return;
    }
    const success = await addFriend(friendUniqueId);
    if (success) {
      setFriendUniqueId("");
    }
  };

  return (
    <View className="bg-btc500">
      <View className="flex-row items-center">
        <Text className="text-btc100 font-funnel-regular text-2xl items-start">
          Add Friend
        </Text>
      </View>
      <View className="mt-2">
        <TextInput
          value={friendUniqueId}
          placeholder="Unique ID"
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
          name="adduser"
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
