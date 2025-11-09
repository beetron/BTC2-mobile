import axiosClient from "@/src/utils/axiosClient";
import { useState } from "react";
import { Alert } from "react-native";
import { useNetwork } from "@/src/context/NetworkContext";

const useChangePassword = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { isConnected } = useNetwork();

  const changePassword = async (
    currentPassword: string,
    newPassword: string
  ): Promise<boolean> => {
    try {
      setIsLoading(true);

      if (!currentPassword || !newPassword) return false;

      if (!isConnected) {
        Alert.alert(
          "No Internet Connection",
          "Please check your connection and try again"
        );
        return false;
      }

      // Send passwords to API
      const response = await axiosClient.put("/users/changepassword", {
        currentPassword,
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

      if (error.networkError === "TIMEOUT") {
        Alert.alert(
          "Connection Timeout",
          "Request took too long. Please try again"
        );
      } else if (error.networkError === "NO_INTERNET") {
        // Already alerted in pre-flight check
      } else if (
        error.response &&
        error.response.data &&
        error.response.data.error
      ) {
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
