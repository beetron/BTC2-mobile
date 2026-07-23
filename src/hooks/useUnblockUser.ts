import { Alert } from "react-native";
import axiosClient from "../utils/axiosClient";
import { useState } from "react";
import { useNetwork } from "@/src/context/NetworkContext";
import { useTranslation } from "@/src/hooks/useTranslation";

const useUnblockUser = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { isConnected } = useNetwork();
  const { t } = useTranslation();

  const unblockUser = async (friendId: string): Promise<boolean> => {
    try {
      setIsLoading(true);

      if (!isConnected) {
        Alert.alert(t("errors.noInternetTitle"), t("errors.noInternetGeneric"));
        return false;
      }

      const response = await axiosClient.put(`/users/unblockuser/${friendId}`);

      if (response.status === 200) {
        // If backend returns message, show it
        if (response.data && response.data.message) {
          Alert.alert(t("common.success"), response.data.message);
        } else {
          Alert.alert(t("common.success"), t("friends.unblockedSuccess"));
        }
        return true;
      }

      // If not 200, show error if present
      if (response.data && response.data.error) {
        Alert.alert(t("common.error"), response.data.error);
      }

      return false;
    } catch (error: any) {
      if (error.networkError === "TIMEOUT") {
        Alert.alert(
          t("errors.connectionTimeoutTitle"),
          t("errors.connectionTimeoutMessage")
        );
      } else if (error.networkError === "NO_INTERNET") {
        // Already handled
      } else if (
        error.response &&
        error.response.data &&
        error.response.data.error
      ) {
        Alert.alert(t("common.error"), error.response.data.error);
      } else {
        Alert.alert(t("common.error"), t("errors.generic"));
      }
      console.error("Error in useUnblockUser:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { unblockUser, isLoading };
};

export default useUnblockUser;
