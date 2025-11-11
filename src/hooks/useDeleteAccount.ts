import { useState } from "react";
import axiosClient from "../utils/axiosClient";
import { API_URL } from "../constants/api";

export const useDeleteAccount = () => {
  const [isLoading, setIsLoading] = useState(false);

  const deleteAccount = async (
    userId: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);

      const response = await axiosClient.delete(
        `/auth/deleteAccount/${userId}`
      );

      setIsLoading(false);

      if (response.status === 200) {
        return {
          success: true,
        };
      }

      return {
        success: false,
        error: response.data.error || "Failed to delete account",
      };
    } catch (error: any) {
      setIsLoading(false);

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

  return { deleteAccount, isLoading };
};
