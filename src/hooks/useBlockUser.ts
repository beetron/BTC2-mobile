import { Alert } from "react-native";
import axiosClient from "../utils/axiosClient";
import { useState } from "react";
import { useNetwork } from "@/src/context/NetworkContext";
import { useTranslation } from "@/src/hooks/useTranslation";

const useBlockUser = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { isConnected } = useNetwork();
  const { t } = useTranslation();

  const blockUser = async (friendId: string): Promise<boolean> => {
    try {
      setIsLoading(true);

      if (!isConnected) {
        Alert.alert(t("errors.noInternetTitle"), t("errors.noInternetGeneric"));
        return false;
      }

      const response = await axiosClient.put(`/users/blockuser/${friendId}`);

      if (response.status === 200) {
        if (response.data && response.data.message) {
          Alert.alert(t("common.success"), response.data.message);
        } else {
          Alert.alert(t("common.success"), t("friends.blockedSuccess"));
        }
        return true;
      }

      // Non-200 fallback
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
        // already alerted above
      } else if (
        error.response &&
        error.response.data &&
        error.response.data.error
      ) {
        Alert.alert(t("common.error"), error.response.data.error);
      } else {
        Alert.alert(t("common.error"), t("errors.generic"));
      }
      console.error("Error in useBlockUser:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { blockUser, isLoading };
};

export default useBlockUser;
