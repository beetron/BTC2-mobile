import { Alert } from "react-native";
import axiosClient from "../utils/axiosClient";
import { useState } from "react";
import { useNetwork } from "@/src/context/NetworkContext";
import { useTranslation } from "@/src/hooks/useTranslation";

const useUpdateGroupInfo = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { isConnected } = useNetwork();
  const { t } = useTranslation();

  const updateGroupInfo = async (
    conversationId: string,
    name: string
  ): Promise<boolean> => {
    try {
      setIsLoading(true);

      if (!isConnected) {
        Alert.alert(t("errors.noInternetTitle"), t("errors.noInternetGeneric"));
        return false;
      }

      await axiosClient.put(`/conversations/${conversationId}`, { name });
      return true;
    } catch (error: any) {
      if (error.networkError === "TIMEOUT") {
        Alert.alert(
          t("errors.connectionTimeoutTitle"),
          t("errors.connectionTimeoutMessage")
        );
      } else if (error.networkError === "NO_INTERNET") {
        // already alerted above
      } else if (error.response?.data?.error) {
        Alert.alert(t("common.error"), error.response.data.error);
      } else {
        Alert.alert(t("common.error"), t("group.updateFailed"));
      }
      console.error("Error in useUpdateGroupInfo:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { updateGroupInfo, isLoading };
};

export default useUpdateGroupInfo;
