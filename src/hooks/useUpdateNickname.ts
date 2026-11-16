import { useState } from "react";
import { Alert } from "react-native";
import { useAuth } from "@/src/context/AuthContext";
import * as SecureStore from "expo-secure-store";
import axiosClient from "@/src/utils/axiosClient";
import { useNetwork } from "@/src/context/NetworkContext";
import { useTranslation } from "@/src/hooks/useTranslation";
import { serverErrorMessage } from "@/src/utils/serverError";

const useUpdateNickname = () => {
  const { authState, setAuthState } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { isConnected } = useNetwork();
  const { t } = useTranslation();
  const USER_KEY = "user";

  const updateNickname = async (newNickname: string) => {
    if (!newNickname) return false;

    try {
      setIsLoading(true);

      if (!isConnected) {
        Alert.alert(t("errors.noInternetTitle"), t("errors.noInternetGeneric"));
        return false;
      }

      // Encoded: the nickname is free text, and "?", "#", "/" or "%" in a
      // raw path cut it short or made the request fail
      const response = await axiosClient.put(
        `/users/updatenickname/${encodeURIComponent(newNickname)}`
      );

      if (response.status === 200) {
        if (authState?.user && setAuthState) {
          // Update the user object in authState with the new nickname
          const updatedUser = {
            ...authState?.user,
            nickname: newNickname,
          };

          // Functional update: the request may have refreshed the access
          // token meanwhile, and spreading the authState captured before it
          // would put the expired token back
          setAuthState((prev) => ({ ...prev, user: updatedUser }));

          console.log("Updating user via hook: ", updatedUser);

          // Update SecureStore
          await SecureStore.setItemAsync(USER_KEY, JSON.stringify(updatedUser));
          return true;
        }
        return false;
      }
    } catch (error: any) {
      console.error("Error updating nickname: ", error);

      if (error.networkError === "TIMEOUT") {
        Alert.alert(
          t("errors.connectionTimeoutTitle"),
          t("errors.connectionTimeoutMessage")
        );
      } else if (error.networkError === "NO_INTERNET") {
        // Already alerted in pre-flight check
      } else {
        Alert.alert(
          t("common.error"),
          serverErrorMessage(error, t, "settings.nickname.updateFailedError")
        );
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  return { updateNickname, isLoading };
};

export default useUpdateNickname;
