import { useAuth } from "@/src/context/AuthContext";
import { useNetwork } from "@/src/context/NetworkContext";
import { useCallback } from "react";
import { API_URL } from "@/src/constants/api";

interface ImageSource {
  uri: string;
  headers?: Record<string, string>;
}

const useGetMessageImages = () => {
  const { isConnected } = useNetwork();
  const { authState } = useAuth();

  const getMessageImageSource = useCallback(
    (filename: string): ImageSource => {
      if (!filename) return { uri: "" };

      const uri = `${API_URL}/messages/uploads/images/${filename}`;

      // Get auth token from authState
      const token = authState?.token || "";

      return {
        uri,
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {},
      };
    },
    [authState?.token]
  );

  return { getMessageImageSource, isConnected };
};

export default useGetMessageImages;
