import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import * as SecureStore from "expo-secure-store";
import axiosClient from "@/utils/axiosClient";

const useUpdateNickname = () => {
  const { authState, setAuthState } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const USER_KEY = "user";

  const updateNickname = async (newNickname: string) => {
    if (!newNickname) return false;

    try {
      setIsLoading(true);
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
    } catch (error) {
      console.error("Error updating nickname: ", error);
    } finally {
      setIsLoading(false);
    }
  };
  return { updateNickname, isLoading };
};

export default useUpdateNickname;
