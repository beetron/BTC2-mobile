import { useState } from "react";
import axios from "axios";
import { API_URL } from "../constants/api";

interface ForgotPasswordRequest {
  username: string;
  email: string;
}

export const useForgotPassword = () => {
  const [isLoading, setIsLoading] = useState(false);

  const forgotPassword = async (
    data: ForgotPasswordRequest
  ): Promise<{ success: boolean; message?: string; error?: string }> => {
    try {
      setIsLoading(true);

      const response = await axios.post(`${API_URL}/auth/forgotpassword`, {
        username: data.username.toLowerCase(),
        email: data.email.toLowerCase(),
      });

      setIsLoading(false);

      if (response.status === 200) {
        return {
          success: true,
          message: response.data.message,
        };
      }

      return {
        success: false,
        error: response.data.error || "Failed to reset password",
      };
    } catch (error: any) {
      setIsLoading(false);

      // Handle 404 errors with generic message
      if (error.response?.status === 404) {
        return {
          success: false,
          error: "Error, please try again later",
        };
      }

      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "Error, please try again later";

      return {
        success: false,
        error: errorMessage,
      };
    }
  };

  return { forgotPassword, isLoading };
};
