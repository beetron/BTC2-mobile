import { Alert } from "react-native";
import axiosClient from "../utils/axiosClient";
import { useState } from "react";
import { useNetwork } from "@/src/context/NetworkContext";
import { useTranslation } from "@/src/hooks/useTranslation";
import { serverErrorMessage } from "@/src/utils/serverError";

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
        Alert.alert(t("common.success"), t("friends.unblockedSuccess"));
        return true;
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
      } else {
        Alert.alert(t("common.error"), serverErrorMessage(error, t, "errors.generic"));
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
