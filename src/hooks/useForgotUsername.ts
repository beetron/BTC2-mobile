import { useState } from "react";
import axios from "axios";
import { API_URL } from "../constants/api";

interface ForgotUsernameRequest {
  email: string;
}

export const useForgotUsername = () => {
  const [isLoading, setIsLoading] = useState(false);

  const forgotUsername = async (
    data: ForgotUsernameRequest
  ): Promise<{ success: boolean; message?: string; error?: string }> => {
    try {
      setIsLoading(true);

      const response = await axios.post(`${API_URL}/auth/forgotusername`, {
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
        error: response.data.error || "Failed to retrieve username",
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

  return { forgotUsername, isLoading };
};
