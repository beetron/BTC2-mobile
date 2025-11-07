import axiosClient from "@/src/utils/axiosClient";
import { useState } from "react";
import { Alert } from "react-native";

const useUpdateEmail = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const updateEmail = async (
    email: string,
    password: string
  ): Promise<boolean> => {
    try {
      setIsLoading(true);

      if (!email || !password) return false;

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
      if (error.response && error.response.data) {
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
