import { View, Text, Alert, Keyboard, TouchableOpacity } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useState, useCallback, useEffect, useRef } from "react";
import useAddFriend from "@/src/hooks/useAddFriend";
import { useFocusEffect } from "expo-router";
import { useTranslation } from "../hooks/useTranslation";
import { useTypeScale } from "../hooks/useTypeScale";
import { useAuth } from "../context/AuthContext";
import { useThemeColors } from "../context/ThemeContext";
import CustomButton from "./CustomButton";
import CustomInput from "./CustomInput";

const EditAddFriend = () => {
  const [friendUniqueId, setFriendUniqueId] = useState("");
  const { addFriend, loading } = useAddFriend();
  const { t } = useTranslation();
  const ts = useTypeScale();
  const { authState } = useAuth();
  const myUniqueId = authState?.user?.uniqueId;
  const colors = useThemeColors();
  const [copied, setCopied] = useState(false);
  const copiedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (copiedTimer.current) clearTimeout(copiedTimer.current);
  }, []);

  // expo-clipboard is loaded on demand: a dev build made before it was added
  // has no native module, and a top-level import would crash the whole
  // screen. Until the app is rebuilt, the button explains instead.
  const handleCopyId = async () => {
    if (!myUniqueId) return;
    try {
      const Clipboard = await import("expo-clipboard");
      await Clipboard.setStringAsync(myUniqueId);
      setCopied(true);
      if (copiedTimer.current) clearTimeout(copiedTimer.current);
      copiedTimer.current = setTimeout(() => setCopied(false), 1500);
    } catch {
      Alert.alert(t("friends.addFriend.copyUnavailable"));
    }
  };

  // Reset text input when switching tabs
  useFocusEffect(
    useCallback(() => {
      setFriendUniqueId("");
    }, [])
  );

  // Handle onPress
  const handleOnPress = async () => {
    if (!friendUniqueId.trim()) {
      Alert.alert(t("friends.addFriend.missingIdTitle"));
      return;
    }
    Keyboard.dismiss();
    // Pasted IDs often carry a trailing space; the button already checks
    // the trimmed value
    const success = await addFriend(friendUniqueId.trim());
    if (success) {
      setFriendUniqueId("");
    }
  };

  return (
    <View>
      {/* ID only -- your own QR code lives on the QR code screen */}
      <CustomInput
        title={t("friends.addFriend.idLabel")}
        placeholder={t("friends.addFriend.placeholder")}
        value={friendUniqueId}
        autoCapitalize="none"
        autoCorrect={false}
        maxLength={20}
        onChangeText={setFriendUniqueId}
        helperText={`${friendUniqueId.length}/20`}
      />
      <CustomButton
        title={t("common.add")}
        handlePress={handleOnPress}
        isLoading={loading}
        disabled={!friendUniqueId.trim()}
        containerStyles="mt-4"
      />

      {/* Your own ID (option A "identity row"): label stacked above the
          value so they read as one unit; copy on the right. */}
      {myUniqueId ? (
        <View
          className="flex-row items-center gap-3 mt-6 pl-3.5 pr-3 py-3 rounded-[20px] bg-surface border border-border"
          style={{ minHeight: 64 }}
        >
          <View
            className="items-center justify-center rounded-xl bg-primarySoft"
            style={{ width: 40, height: 40 }}
          >
            <MaterialCommunityIcons name="card-account-details-outline" size={21} color={colors.primary} />
          </View>
          <View className="flex-1 min-w-0">
            <Text className={`${ts.sectionHeader} text-inkMuted`}>
              {t("friends.addFriend.yourIdLabel")}
            </Text>
            <Text className={`${ts.title} text-ink`} numberOfLines={1} selectable>
              {myUniqueId}
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleCopyId}
            accessibilityRole="button"
            accessibilityLabel={t("friends.addFriend.copyIdA11y", { id: myUniqueId })}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: copied ? colors.primarySoft : colors.surfaceMuted,
            }}
          >
            <MaterialCommunityIcons
              name={copied ? "check" : "content-copy"}
              size={19}
              color={copied ? colors.primary : colors.ink}
            />
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
};

export default EditAddFriend;
