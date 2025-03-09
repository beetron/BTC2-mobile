import React from "react";
import { View, TouchableOpacity, TextInput } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

const ConversationInput = () => {
  // Handle send message
  const handleOnPress = () => {};

  return (
    <View className="flex-1 max-h-24 justify-center border-t-hairline border-btc100 bg-[#1f1f2e]">
      <View className="flex-row justify-end items-center bottom-4 right-5">
        <TextInput
          placeholder="Start typing..."
          placeholderTextColor="black"
          className="h-10 w-3/4 px-4 mr-2 bg-btc100 rounded-2xl border-2 border-btc20"
        />
        <TouchableOpacity onPress={handleOnPress}>
          <Ionicons name="send-sharp" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ConversationInput;
