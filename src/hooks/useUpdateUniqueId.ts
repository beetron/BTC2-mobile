import { useState } from "react";
import { useAuth } from "@/src/context/AuthContext";
import * as SecureStore from "expo-secure-store";
import axiosClient from "@/src/utils/axiosClient";
import { Alert } from "react-native";
import { useNetwork } from "@/src/context/NetworkContext";
import { useTranslation } from "@/src/hooks/useTranslation";
import { serverErrorMessage } from "@/src/utils/serverError";

const useUpdateUniqueId = () => {
  const { authState, setAuthState } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { isConnected } = useNetwork();
  const { t } = useTranslation();
  const USER_KEY = "user";

  const updateUniqueId = async (newUniqueId: string) => {
    if (!newUniqueId) return false;

    try {
      setIsLoading(true);

      if (!isConnected) {
        Alert.alert(t("errors.noInternetTitle"), t("errors.noInternetGeneric"));
        return false;
      }

      // Convert unique ID to lowercase
      const lowercaseUniqueId = newUniqueId.toLowerCase();

      // 4xx now rejects like every other request, so an expired access
      // token goes through axiosClient's refresh-and-retry instead of
      // resolving as a plain 401 here
      const response = await axiosClient.put(
        `/users/updateuniqueid/${encodeURIComponent(lowercaseUniqueId)}`
      );

      if (response.status === 200) {
        Alert.alert(t("settings.uniqueId.updatedFallback"));
        console.log("Unique ID updated via useUpdateUniqueId hook");
        if (authState?.user && setAuthState) {
          // Stored lowercased, as the server does
          const updatedUser = {
            ...authState?.user,
            uniqueId: lowercaseUniqueId,
          };

          // Functional update: don't put back a token refreshed meanwhile
          setAuthState((prev) => ({ ...prev, user: updatedUser }));

          console.log("Updating user via hook: ", updatedUser);

          // Update SecureStore
          await SecureStore.setItemAsync(USER_KEY, JSON.stringify(updatedUser));
          return true;
        }
        return false;
      } else {
        Alert.alert(t("common.error"), t("errors.generic"));
        return false;
      }
    } catch (error: any) {
      console.log("Error in useUpdateUniqueId: ", error);

      if (error.networkError === "TIMEOUT") {
        Alert.alert(
          t("errors.connectionTimeoutTitle"),
          t("errors.connectionTimeoutMessage")
        );
      } else if (error.networkError === "NO_INTERNET") {
        // Already alerted in pre-flight check
      } else if (error.response?.status === 400) {
        Alert.alert(
          t("common.error"),
          serverErrorMessage(error, t, "settings.uniqueId.badRequest")
        );
      } else {
        Alert.alert(t("common.error"), t("errors.generic"));
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  return { updateUniqueId, isLoading };
};

export default useUpdateUniqueId;
