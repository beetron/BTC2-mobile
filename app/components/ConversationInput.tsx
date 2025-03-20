import React, { useState } from "react";
import { View, TouchableOpacity, TextInput, Platform } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

const ConversationInput = () => {
  const [message, setMessage] = useState<string>("");
  const [inputHeight, setInputHeight] = useState(40);

  // Handle send message
  const handleOnPress = () => {
    if (message.trim()) {
      console.log("Sending message:", message);
      // TODO: Implement message sending logic here
      // Clear input field and reset height
      setMessage("");
      setInputHeight(40);
    }
  };

  // Handle text change with auto-resize
  const handleTextChange = (message: string) => {
    setMessage(message);
    console.log("Message:", message);

    // Count number of line breaks to adjust height
    const lineBreaks = (message.match(/\n/g) || []).length;
    const newHeight = Math.min(Math.max(40, 40 + lineBreaks * 15), 100);

    if (newHeight !== inputHeight) {
      console.log("Adjusting height to:", newHeight);
      setInputHeight(newHeight);
    }
  };

  return (
    <View className="flex min-h-28 max-h-60 justify-center border-t-hairline border-btc100 bg-[#1f1f2e] overflow-hidden">
      <View className="flex-row justify-end items-center right-5 py-2">
        <TextInput
          placeholder="Start typing..."
          placeholderTextColor="black"
          className="w-3/4 px-4 mr-2 pb-1 text-lg bg-btc100 rounded-2xl border-2 border-btc20"
          multiline={true}
          textAlignVertical="top"
          style={{
            minHeight: 40,
            maxHeight: 100,
            height: inputHeight,
            paddingTop: Platform.OS === "ios" ? 10 : 0, // Fix for iOS text alignment
          }}
          value={message}
          onChangeText={handleTextChange}
        />
        <TouchableOpacity
          onPress={handleOnPress}
          disabled={!message.trim()}
          style={{ opacity: message.trim() ? 1 : 0.2 }}
        >
          <Ionicons name="send-sharp" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ConversationInput;
