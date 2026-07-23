import { Alert } from "react-native";
import axiosClient from "../utils/axiosClient";
import { useState } from "react";
import { useNetwork } from "@/src/context/NetworkContext";
import { useTranslation } from "@/src/hooks/useTranslation";

// Used both for "owner removes someone else" and "leave group" (self as
// userId) -- the backend applies the same role rules either way: no role
// check when userId === the actor's own id.
const useRemoveGroupMember = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { isConnected } = useNetwork();
  const { t } = useTranslation();

  const removeGroupMember = async (
    conversationId: string,
    userId: string
  ): Promise<boolean> => {
    try {
      setIsLoading(true);

      if (!isConnected) {
        Alert.alert(t("errors.noInternetTitle"), t("errors.noInternetGeneric"));
        return false;
      }

      await axiosClient.delete(
        `/conversations/${conversationId}/members/${userId}`
      );
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
        Alert.alert(t("common.error"), t("group.removeMemberFailed"));
      }
      console.error("Error in useRemoveGroupMember:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { removeGroupMember, isLoading };
};

export default useRemoveGroupMember;
