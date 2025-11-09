import React, { useState } from "react";
import { View, TouchableOpacity, TextInput } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import AntDesign from "@expo/vector-icons/AntDesign";
import useSendeMessages from "../hooks/useSendMessage";

const ConversationInput = () => {
  const [message, setMessage] = useState<string>("");
  const { sendMessage, isLoading } = useSendeMessages();

  // Handle send message
  const handleOnPress = () => {
    if (message.trim()) {
      sendMessage(message);
      console.log("Sending message:", message);

      // Clear input field
      setMessage("");
    }
  };

  // Handle text change
  const handleTextChange = (text: string) => {
    setMessage(text);
  };

  return (
    <View className="flex min-h-28 max-h-60 justify-center border-t-hairline border-btc100 bg-[#1f1f2e] overflow-hidden">
      <View className="flex-row justify-end items-center right-5 py-2">
        <TextInput
          placeholder="Start typing..."
          placeholderTextColor="black"
          className="w-3/4 px-4 mr-2 text-lg bg-btc100 rounded-2xl border-2 border-btc20"
          multiline={true}
          textAlignVertical="top"
          style={{
            maxHeight: 100,
            paddingVertical: 8,
          }}
          value={message}
          onChangeText={handleTextChange}
        />
        <TouchableOpacity
          onPress={handleOnPress}
          disabled={!message.trim()}
          style={{ opacity: message.trim() ? 1 : 0.2 }}
        >
          {isLoading ? (
            <AntDesign name="loading1" size={24} color="black" />
          ) : (
            <Ionicons name="send-sharp" size={24} color="white" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ConversationInput;
