import { useState } from "react";
import { useAuth } from "@/src/context/AuthContext";
import * as SecureStore from "expo-secure-store";
import axiosClient from "@/src/utils/axiosClient";

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
        `/users/updateuniqueid/${lowercaseUniqueId}`
      );

      if (response.status === 200) {
        if (authState?.user && setAuthState) {
          // Update the user object in authState with the new nickname
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
      }
    } catch (error) {
      console.error("Error updating nickname: ", error);
    } finally {
      setIsLoading(false);
    }
  };
  return { updateUniqueId, isLoading };
};

export default useUpdateUniqueId;
