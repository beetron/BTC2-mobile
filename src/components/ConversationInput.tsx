import React, { useState } from "react";
import { View, TextInput, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useKeyboardState } from "react-native-keyboard-controller";
import IconCircleButton from "./IconCircleButton";
import { useThemeColors } from "../context/ThemeContext";
import useSendeMessages from "../hooks/useSendMessage";
import { useAttachImages } from "../hooks/useAttachImages";
import { useSendImages } from "../hooks/useSendImages";
import { useTranslation } from "../hooks/useTranslation";

const ConversationInput = () => {
  const [message, setMessage] = useState<string>("");
  const { t } = useTranslation();
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  // Home-indicator inset only while the keyboard is down -- when it is up
  // the composer sits on the keyboard and the inset would be a dead gap.
  const keyboardVisible = useKeyboardState((state) => state.isVisible);
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

  const canSend = !!message.trim() && !isDisabled;

  return (
    <View
      className="bg-surface border-t border-border px-3 pt-2"
      style={{ paddingBottom: keyboardVisible ? 10 : Math.max(insets.bottom, 10) }}
    >
      <View className="flex-row items-end gap-2">
        <IconCircleButton
          icon="plus"
          variant="muted"
          accessibilityLabel={t("conversation.attachPhotos")}
          onPress={handleAttachImages}
          disabled={isDisabled}
        />
        <TextInput
          placeholder={t("conversation.inputPlaceholder")}
          placeholderTextColor={colors.inkSubtle}
          accessibilityLabel={t("conversation.inputPlaceholder")}
          className="flex-1 px-4 font-funnel-regular"
          multiline={true}
          textAlignVertical="center"
          style={{
            minHeight: 44,
            maxHeight: 120,
            paddingTop: 11,
            paddingBottom: 11,
            borderRadius: 22,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.bg,
            color: colors.ink,
            fontSize: 16,
          }}
          value={message}
          onChangeText={handleTextChange}
          // Intentionally always editable: toggling `editable` in the same
          // render as the clear makes iOS blur the field, which commits any
          // in-progress IME / predictive text and drops the clear. The send
          // button is already disabled while sending.
        />
        {isLoading ? (
          <View style={{ width: 44, height: 44, alignItems: "center", justifyContent: "center" }}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        ) : (
          <IconCircleButton
            icon="arrow-up"
            variant="primary"
            accessibilityLabel={t("conversation.send")}
            onPress={handleOnPress}
            disabled={!canSend}
          />
        )}
      </View>
    </View>
  );
};

export default ConversationInput;
