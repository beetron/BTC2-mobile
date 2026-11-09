import React, { useState } from "react";
import { View, TouchableOpacity, TextInput, ActivityIndicator } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import useSendeMessages from "../hooks/useSendMessage";
import { useAttachImages } from "../hooks/useAttachImages";
import { useSendImages } from "../hooks/useSendImages";
import { useTranslation } from "../hooks/useTranslation";

const ConversationInput = () => {
  const [message, setMessage] = useState<string>("");
  const { t } = useTranslation();
  const { sendMessage, isLoading } = useSendeMessages();
  const { attachImages } = useAttachImages();
  const { sendImages, isLoading: isImageLoading } = useSendImages();

  // Handle send message
  const handleOnPress = async () => {
    const sent = message;
    if (!sent.trim()) return;

    // Clear immediately so the composer feels responsive
    setMessage("");

    const ok = await sendMessage(sent);
    if (!ok) {
      // Restore the unsent text, unless the user already started typing again
      setMessage((current) => (current === "" ? sent : current));
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
      // useSendImages bumps the store's refreshSignal on success, which
      // triggers ConversationMessages' useGetMessages instance to refetch.
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
          <MaterialCommunityIcons name="paperclip" size={24} color="white" />
        </TouchableOpacity>
        <TextInput
          placeholder={t("conversation.inputPlaceholder")}
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
          // Intentionally always editable: toggling `editable` in the same
          // render as the clear makes iOS blur the field, which commits any
          // in-progress IME / predictive text and drops the clear. The send
          // button is already disabled while sending.
        />
        <TouchableOpacity
          onPress={handleOnPress}
          disabled={!message.trim() || isDisabled}
          style={{ opacity: message.trim() && !isDisabled ? 1 : 0.2 }}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <MaterialCommunityIcons name="send" size={24} color="white" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ConversationInput;
