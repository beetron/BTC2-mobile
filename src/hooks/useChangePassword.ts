import axiosClient from "@/src/utils/axiosClient";
import { useState } from "react";
import { Alert } from "react-native";

const useChangePassword = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const changePassword = async (newPassword: string): Promise<boolean> => {
    try {
      setIsLoading(true);

      if (!newPassword) return false;

      // Send new passwrod to API
      const response = await axiosClient.put("/users/changepassword", {
        password: newPassword,
      });

      if (response.status === 200) {
        Alert.alert("Password changed");
        console.log("Password changed via useChangePassword hook");
        return true;
      }
      return false;
    } catch (error: any) {
      console.log("Error in useChangePassword: ", error);
      if (error.response && error.response.data && error.response.data.error) {
        Alert.alert("Error", error.response.data.error);
      } else {
        Alert.alert("Error", "An unknown error occurred");
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  return { changePassword, isLoading };
};

export default useChangePassword;
