import { Alert } from "react-native";
import axiosClient from "../utils/axiosClient";
import { useState } from "react";
import { useNetwork } from "@/src/context/NetworkContext";
import { useTranslation } from "@/src/hooks/useTranslation";
import { serverErrorMessage } from "@/src/utils/serverError";

const useAddGroupMembers = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { isConnected } = useNetwork();
  const { t } = useTranslation();

  const addGroupMembers = async (
    conversationId: string,
    memberIds: string[]
  ): Promise<boolean> => {
    try {
      setIsLoading(true);

      if (!isConnected) {
        Alert.alert(t("errors.noInternetTitle"), t("errors.noInternetGeneric"));
        return false;
      }

      await axiosClient.put(`/conversations/${conversationId}/members`, {
        memberIds,
      });
      return true;
    } catch (error: any) {
      if (error.networkError === "TIMEOUT") {
        Alert.alert(
          t("errors.connectionTimeoutTitle"),
          t("errors.connectionTimeoutMessage")
        );
      } else if (error.networkError === "NO_INTERNET") {
        // already alerted above
      } else {
        Alert.alert(t("common.error"), serverErrorMessage(error, t, "group.addMembersFailed"));
      }
      console.error("Error in useAddGroupMembers:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { addGroupMembers, isLoading };
};

export default useAddGroupMembers;
