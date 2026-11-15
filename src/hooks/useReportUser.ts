import axiosClient from "@/src/utils/axiosClient";
import { useState } from "react";
import { Alert } from "react-native";
import { useNetwork } from "@/src/context/NetworkContext";
import { useTranslation } from "@/src/hooks/useTranslation";

interface ReportUserData {
  reason: string;
  friendId: string;
}

const useReportUser = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { isConnected } = useNetwork();
  const { t } = useTranslation();

  const reportUser = async (data: ReportUserData): Promise<boolean> => {
    try {
      setIsLoading(true);

      if (!isConnected) {
        Alert.alert(t("errors.noInternetTitle"), t("errors.noInternetReportUsers"));
        return false;
      }

      // API call to report user
      console.log("Making API call to /users/reportuser with data:", data);
      const response = await axiosClient.post("/users/reportuser", data);
      console.log("API response status:", response.status);

      if (response.status === 200) {
        console.log("useReportUser successful");
        return true;
      }
      Alert.alert(t("common.error"), t("errors.generic"));
      return false;
    } catch (error: any) {
      if (error.networkError === "TIMEOUT") {
        Alert.alert(
          t("errors.connectionTimeoutTitle"),
          t("errors.connectionTimeoutMessage")
        );
      } else if (error.networkError === "NO_INTERNET") {
        // Already alerted in pre-flight check
      } else {
        // Never fail silently here: the user would assume the report went
        // through. Server text is English-only, so use the translated one.
        console.error("Error reporting user:", error.response?.data?.error ?? error);
        Alert.alert(t("common.error"), t("errors.generic"));
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { reportUser, isLoading };
};

export default useReportUser;
