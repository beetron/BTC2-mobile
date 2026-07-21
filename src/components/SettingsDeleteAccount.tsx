import { useState } from "react";
import { TouchableOpacity, Text, Alert, View } from "react-native";
import { useAuth } from "../context/AuthContext";
import { useDeleteAccount } from "../hooks/useDeleteAccount";
import { useRouter } from "expo-router";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useTranslation } from "../hooks/useTranslation";

const SettingsDeleteAccount = () => {
  const { authState, onLogout } = useAuth();
  const { deleteAccount, isLoading } = useDeleteAccount();
  const router = useRouter();
  const { t } = useTranslation();

  const handleDeleteAccount = async () => {
    // Show confirmation alert
    Alert.alert(
      t("settings.deleteAccount.confirmTitle"),
      t("settings.deleteAccount.confirmMessage"),
      [
        {
          text: t("common.cancel"),
          onPress: () => {},
          style: "cancel",
        },
        {
          text: t("common.delete"),
          onPress: async () => {
            if (!authState?.user?._id) {
              Alert.alert(
                t("common.error"),
                t("settings.deleteAccount.userIdNotFoundError")
              );
              return;
            }

            const result = await deleteAccount(authState.user._id);

            if (result.success) {
              Alert.alert(
                t("settings.deleteAccount.deletedTitle"),
                t("settings.deleteAccount.deletedMessage"),
                [
                  {
                    text: t("common.ok"),
                    onPress: async () => {
                      // Logout to clear secure storage
                      if (onLogout) {
                        await onLogout();
                      }
                      // Redirect to login
                      router.replace("/guests/Login");
                    },
                  },
                ]
              );
            } else if (result.error) {
              Alert.alert(t("common.error"), result.error);
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  return (
    <View className="py-4">
      <TouchableOpacity
        onPress={handleDeleteAccount}
        disabled={isLoading}
        className="bg-red-500 rounded-lg px-4 py-3 flex-row items-center justify-center gap-2 min-h-11"
        style={{ opacity: isLoading ? 0.6 : 1 }}
      >
        {isLoading ? (
          <AntDesign name="loading" size={18} color="white" />
        ) : null}
        <Text className="text-white text-base font-funnel-regular font-semibold">
          {isLoading ? t("settings.deleteAccount.deletingLabel") : t("settings.deleteAccount.buttonLabel")}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default SettingsDeleteAccount;
