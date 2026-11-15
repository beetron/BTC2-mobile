import React, { useEffect, useRef, useState } from "react";
import { View, TextInput, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useKeyboardState } from "react-native-keyboard-controller";
import IconCircleButton from "./IconCircleButton";
import ComposerContextBar from "./ComposerContextBar";
import { useThemeColors } from "../context/ThemeContext";
import useSendeMessages from "../hooks/useSendMessage";
import { useAttachImages } from "../hooks/useAttachImages";
import { useSendImages } from "../hooks/useSendImages";
import useMessageActions from "../hooks/useMessageActions";
import { useTranslation } from "../hooks/useTranslation";
import { useBodyFontSize } from "../hooks/useTypeScale";
import conversationStore, { ComposerState } from "../zustand/conversationStore";

// Same limit the API enforces for sends and edits
const MAX_MESSAGE_LENGTH = 10000;

const ConversationInput = () => {
  const [message, setMessage] = useState<string>("");
  const { t } = useTranslation();
  const colors = useThemeColors();
  const bodySize = useBodyFontSize();
  const insets = useSafeAreaInsets();
  // Home-indicator inset only while the keyboard is down -- when it is up
  // the composer sits on the keyboard and the inset would be a dead gap.
  const keyboardVisible = useKeyboardState((state) => state.isVisible);
  const { sendMessage, isLoading } = useSendeMessages();
  const { attachImages } = useAttachImages();
  const { sendImages, isLoading: isImageLoading } = useSendImages();
  const { editMessage, isLoading: isSavingEdit } = useMessageActions();
  const composer = conversationStore((s) => s.composer);
  const clearComposer = conversationStore((s) => s.clearComposer);
  const inputRef = useRef<TextInput>(null);
  // Edit mode borrows the text box: whatever was typed before is put aside
  // here and comes back when the edit is saved or cancelled
  const draftBeforeEdit = useRef<string | null>(null);
  const previousComposer = useRef<ComposerState>(null);

  const isEditing = composer?.mode === "edit";
  const replyTarget = composer?.mode === "reply" ? composer.target : null;

  useEffect(() => {
    const prev = previousComposer.current;
    previousComposer.current = composer;
    if (prev === composer) return;

    const wasEditing = prev?.mode === "edit";
    if (composer?.mode === "edit") {
      if (!wasEditing) draftBeforeEdit.current = message;
      setMessage(composer.target.message ?? "");
    } else if (wasEditing) {
      // Left edit mode (saved, cancelled, target deleted, or switched to a
      // reply): put the earlier draft back
      setMessage(draftBeforeEdit.current ?? "");
      draftBeforeEdit.current = null;
    }
    if (composer) inputRef.current?.focus();
    // Only reacts to mode changes; `message` is read, not tracked
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [composer]);

  const saveEdit = async () => {
    if (composer?.mode !== "edit") return;
    const text = message.trim();
    if (!text) return;
    if (text === (composer.target.message ?? "").trim()) {
      clearComposer();
      return;
    }
    const ok = await editMessage(composer.target._id, text);
    if (ok) clearComposer();
  };

  // Handle send message
  const handleOnPress = async () => {
    if (isEditing) {
      await saveEdit();
      return;
    }

    const sent = message;
    if (!sent.trim()) return;

    // Clear immediately so the composer feels responsive
    setMessage("");

    const ok = await sendMessage(sent, replyTarget?._id);
    if (ok) {
      if (replyTarget) clearComposer();
    } else {
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
      // A reply in progress goes with the photos
      const ok = await sendImages(images, replyTarget?._id);
      if (ok && replyTarget) clearComposer();
    }
  };

  const isBusy = isLoading || isImageLoading || isSavingEdit;

  const canSend = !!message.trim() && !isBusy;

  return (
    <View
      className="bg-surface border-t border-border px-3 pt-2"
      style={{ paddingBottom: keyboardVisible ? 10 : Math.max(insets.bottom, 10) }}
    >
      {composer && <ComposerContextBar composer={composer} onCancel={clearComposer} />}
      <View className="flex-row items-end gap-2">
        <IconCircleButton
          icon="plus"
          variant="muted"
          accessibilityLabel={t("conversation.attachPhotos")}
          onPress={handleAttachImages}
          // Photos can't be added to an existing message
          disabled={isBusy || isEditing}
        />
        <TextInput
          ref={inputRef}
          placeholder={t("conversation.inputPlaceholder")}
          placeholderTextColor={colors.inkSubtle}
          accessibilityLabel={t("conversation.inputPlaceholder")}
          className="flex-1 px-4 font-funnel-regular"
          multiline={true}
          maxLength={MAX_MESSAGE_LENGTH}
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
            fontSize: bodySize,
          }}
          value={message}
          onChangeText={handleTextChange}
          // Intentionally always editable: toggling `editable` in the same
          // render as the clear makes iOS blur the field, which commits any
          // in-progress IME / predictive text and drops the clear. The send
          // button is already disabled while sending.
        />
        {isLoading || isSavingEdit ? (
          <View style={{ width: 44, height: 44, alignItems: "center", justifyContent: "center" }}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        ) : (
          <IconCircleButton
            icon={isEditing ? "check" : "arrow-up"}
            variant="primary"
            accessibilityLabel={
              isEditing ? t("conversation.composer.saveEdit") : t("conversation.send")
            }
            onPress={handleOnPress}
            disabled={!canSend}
          />
        )}
      </View>
    </View>
  );
};

export default ConversationInput;
