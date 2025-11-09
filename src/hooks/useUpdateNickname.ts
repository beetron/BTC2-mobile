import { useState } from "react";
import { Alert } from "react-native";
import { useAuth } from "@/src/context/AuthContext";
import * as SecureStore from "expo-secure-store";
import axiosClient from "@/src/utils/axiosClient";
import { useNetwork } from "@/src/context/NetworkContext";

const useUpdateNickname = () => {
  const { authState, setAuthState } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { isConnected } = useNetwork();
  const USER_KEY = "user";

  const updateNickname = async (newNickname: string) => {
    if (!newNickname) return false;

    try {
      setIsLoading(true);

      if (!isConnected) {
        Alert.alert(
          "No Internet Connection",
          "Please check your connection and try again"
        );
        return false;
      }

      const response = await axiosClient.put(
        `/users/updatenickname/${newNickname}`
      );

      if (response.status === 200) {
        if (authState?.user && setAuthState) {
          // Update the user object in authState with the new nickname
          const updatedUser = {
            ...authState?.user,
            nickname: newNickname,
          };

          setAuthState({
            ...authState,
            user: updatedUser,
          });

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
          "Connection Timeout",
          "Request took too long. Please try again"
        );
      } else if (error.networkError === "NO_INTERNET") {
        // Already alerted in pre-flight check
      } else {
        Alert.alert("Error", "Failed to update nickname");
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  return { updateNickname, isLoading };
};

export default useUpdateNickname;
