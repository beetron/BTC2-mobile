import axiosClient from "@/src/utils/axiosClient";
import { useState } from "react";
import { Alert } from "react-native";
import { useNetwork } from "@/src/context/NetworkContext";

const useUpdateEmail = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { isConnected } = useNetwork();

  const updateEmail = async (
    email: string,
    password: string
  ): Promise<boolean> => {
    try {
      setIsLoading(true);

      if (!email || !password) return false;

      // Check network connection before making request
      if (!isConnected) {
        Alert.alert(
          "No Internet Connection",
          "Please check your connection and try again"
        );
        return false;
      }

      // Send email and password to API
      const response = await axiosClient.put("/users/updateemail", {
        email,
        password,
      });

      if (response.status === 200) {
        Alert.alert(response.data.message || "Email updated");
        console.log("Email updated via useUpdateEmail hook");
        return true;
      }
      return false;
    } catch (error: any) {
      console.log("Error in useUpdateEmail: ", error);

      // Handle network errors tagged by axios interceptor
      if (error.networkError === "TIMEOUT") {
        Alert.alert(
          "Connection Timeout",
          "Request took too long. Please try again"
        );
      } else if (error.networkError === "NO_INTERNET") {
        // Already alerted in pre-flight check
      } else if (error.response && error.response.data) {
        if (error.response.data.error) {
          Alert.alert("Error", error.response.data.error);
        } else if (error.response.data.message) {
          Alert.alert(error.response.data.message);
        } else {
          Alert.alert("Error", "An unknown error occurred");
        }
      } else {
        Alert.alert("Error", "An unknown error occurred");
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  return { updateEmail, isLoading };
};

export default useUpdateEmail;
