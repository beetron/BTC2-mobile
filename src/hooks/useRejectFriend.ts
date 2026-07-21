import { Alert } from "react-native";
import axiosClient from "../utils/axiosClient";
import { useState } from "react";
import { useNetwork } from "@/src/context/NetworkContext";
import { useTranslation } from "@/src/hooks/useTranslation";

const useRejectFriend = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { isConnected } = useNetwork();
  const { t } = useTranslation();

  const rejectFriend = async (uniqueId: string): Promise<boolean> => {
    try {
      setIsLoading(true);

      if (!isConnected) {
        Alert.alert(t("errors.noInternetTitle"), t("errors.noInternetGeneric"));
        return false;
      }

      const response = await axiosClient.put(`/users/rejectfriend/${uniqueId}`);

      if (response.status === 200) {
        Alert.alert(t("friends.rejectedSuccess"));
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
        // Already alerted in pre-flight check
      } else if (
        error.response &&
        error.response.data &&
        error.response.data.error
      ) {
        Alert.alert(t("common.error"), error.response.data.error);
        console.error("Error in useRejectFriend: ", error);
      } else {
        Alert.alert(t("common.error"), t("errors.generic"));
        console.error("Unexpected error in useRejectFriend: ", error);
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { rejectFriend, isLoading };
};

export default useRejectFriend;
