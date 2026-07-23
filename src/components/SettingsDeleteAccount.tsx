import { Alert } from "react-native";
import { useAuth } from "../context/AuthContext";
import { useDeleteAccount } from "../hooks/useDeleteAccount";
import { useRouter } from "expo-router";
import CustomButton from "./CustomButton";
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
    <CustomButton
      title={t("settings.deleteAccount.buttonLabel")}
      handlePress={handleDeleteAccount}
      isLoading={isLoading}
      variant="danger"
      textStyles="text-lg"
      containerStyles="min-h-[44px]"
    />
  );
};

export default SettingsDeleteAccount;
