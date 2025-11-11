import React, { useState } from "react";
import { View, TouchableOpacity, TextInput } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import AntDesign from "@expo/vector-icons/AntDesign";
import useSendeMessages from "../hooks/useSendMessage";
import { useAttachImages } from "../hooks/useAttachImages";
import { useSendImages } from "../hooks/useSendImages";

const ConversationInput = () => {
  const [message, setMessage] = useState<string>("");
  const { sendMessage, isLoading } = useSendeMessages();
  const { attachImages } = useAttachImages();
  const { sendImages, isLoading: isImageLoading } = useSendImages();

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

  // Handle image attachment - immediately send after selection
  const handleAttachImages = async () => {
    const images = await attachImages();
    if (images.length > 0) {
      await sendImages(images);
    }
  };

  const isDisabled = isLoading || isImageLoading;

  return (
    <View className="flex min-h-28 max-h-60 justify-center border-t-hairline border-btc100 bg-[#1f1f2e] overflow-hidden px-5 py-2">
      <View className="flex-row items-center gap-2">
        <TouchableOpacity
          onPress={handleAttachImages}
          disabled={isDisabled}
          style={{ opacity: isDisabled ? 0.2 : 1 }}
        >
          <Ionicons name="attach" size={24} color="white" />
        </TouchableOpacity>
        <TextInput
          placeholder="Start typing..."
          placeholderTextColor="black"
          className="flex-1 px-4 text-lg bg-btc100 rounded-2xl border-2 border-btc20"
          multiline={true}
          textAlignVertical="top"
          style={{
            maxHeight: 100,
            paddingVertical: 8,
          }}
          value={message}
          onChangeText={handleTextChange}
          editable={!isDisabled}
        />
        <TouchableOpacity
          onPress={handleOnPress}
          disabled={!message.trim() || isDisabled}
          style={{ opacity: message.trim() && !isDisabled ? 1 : 0.2 }}
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
