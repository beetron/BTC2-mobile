import axiosClient from "@/src/utils/axiosClient";
import { useState } from "react";
import { Alert } from "react-native";
import { useNetwork } from "@/src/context/NetworkContext";
import { useTranslation } from "@/src/hooks/useTranslation";

const useUpdateEmail = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { isConnected } = useNetwork();
  const { t } = useTranslation();

  const updateEmail = async (
    email: string,
    password: string
  ): Promise<boolean> => {
    try {
      setIsLoading(true);

      if (!email || !password) return false;

      // Check network connection before making request
      if (!isConnected) {
        Alert.alert(t("errors.noInternetTitle"), t("errors.noInternetGeneric"));
        return false;
      }

      // Send email and password to API
      const response = await axiosClient.put("/users/updateemail", {
        email,
        password,
      });

      if (response.status === 200) {
        Alert.alert(response.data.message || t("settings.email.updatedFallback"));
        console.log("Email updated via useUpdateEmail hook");
        return true;
      }
      return false;
    } catch (error: any) {
      console.log("Error in useUpdateEmail: ", error);

      // Handle network errors tagged by axios interceptor
      if (error.networkError === "TIMEOUT") {
        Alert.alert(
          t("errors.connectionTimeoutTitle"),
          t("errors.connectionTimeoutMessage")
        );
      } else if (error.networkError === "NO_INTERNET") {
        // Already alerted in pre-flight check
      } else if (error.response && error.response.data) {
        if (error.response.data.error) {
          Alert.alert(t("common.error"), error.response.data.error);
        } else if (error.response.data.message) {
          Alert.alert(error.response.data.message);
        } else {
          Alert.alert(t("common.error"), t("errors.generic"));
        }
      } else {
        Alert.alert(t("common.error"), t("errors.generic"));
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  return { updateEmail, isLoading };
};

export default useUpdateEmail;
