import { useState } from "react";
import { TouchableOpacity, Text, Alert, View } from "react-native";
import { useAuth } from "../context/AuthContext";
import { useDeleteAccount } from "../hooks/useDeleteAccount";
import { useRouter } from "expo-router";
import AntDesign from "@expo/vector-icons/AntDesign";

const SettingsDeleteAccount = () => {
  const { authState, onLogout } = useAuth();
  const { deleteAccount, isLoading } = useDeleteAccount();
  const router = useRouter();

  const handleDeleteAccount = async () => {
    // Show confirmation alert
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        {
          text: "Cancel",
          onPress: () => {},
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: async () => {
            if (!authState?.user?._id) {
              Alert.alert(
                "Error",
                "Unable to delete account. User ID not found."
              );
              return;
            }

            const result = await deleteAccount(authState.user._id);

            if (result.success) {
              Alert.alert(
                "Account Deleted",
                "Your account has been deleted successfully.",
                [
                  {
                    text: "OK",
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
              Alert.alert("Error", result.error);
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
          <AntDesign name="loading1" size={18} color="white" />
        ) : null}
        <Text className="text-white text-base font-funnel-regular font-semibold">
          {isLoading ? "Deleting..." : "Delete Account"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default SettingsDeleteAccount;
