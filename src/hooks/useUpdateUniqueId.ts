import { useState } from "react";
import { useAuth } from "@/src/context/AuthContext";
import * as SecureStore from "expo-secure-store";
import axiosClient from "@/src/utils/axiosClient";
import { Alert } from "react-native";

const useUpdateUniqueId = () => {
  const { authState, setAuthState } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const USER_KEY = "user";

  const updateUniqueId = async (newUniqueId: string) => {
    if (!newUniqueId) return false;

    try {
      setIsLoading(true);

      // Convert unique ID to lowercase
      const lowercaseUniqueId = newUniqueId.toLowerCase();

      const response = await axiosClient.put(
        `/users/updateuniqueid/${lowercaseUniqueId}`,
        {},
        {
          validateStatus: (status) => status < 500, // Resolve on 2xx and 4xx, reject on 5xx
        }
      );

      if (response.status === 200) {
        Alert.alert(response.data.message || "Unique ID updated");
        console.log("Unique ID updated via useUpdateUniqueId hook");
        if (authState?.user && setAuthState) {
          // Update the user object in authState with the new uniqueId
          const updatedUser = {
            ...authState?.user,
            uniqueId: newUniqueId,
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
      } else if (response.status === 400) {
        Alert.alert("Error", response.data.error || "Bad request");
        return false;
      } else {
        Alert.alert("Error", "An unknown error occurred");
        return false;
      }
    } catch (error: any) {
      console.log("Error in useUpdateUniqueId: ", error);
      Alert.alert("Error", "An unknown error occurred");
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  return { updateUniqueId, isLoading };
};

export default useUpdateUniqueId;
