import axiosClient from "@/src/utils/axiosClient";
import { fromByteArray } from "base64-js";
import { useState } from "react";
import { Alert } from "react-native";
import { useNetwork } from "@/src/context/NetworkContext";

const getMimeType = (url: string): string => {
  const extension = url.toLowerCase().split(".").pop();

  switch (extension) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "heic":
      return "image/heic";
    default:
      return "image/jpeg";
  }
};

const useGetProfileImage = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { isConnected } = useNetwork();

  const getProfileImage = async (url: string) => {
    try {
      setIsLoading(true);

      if (!url) return null;

      if (!isConnected) {
        console.warn("No internet connection - cannot load profile image");
        return null;
      }

      const response = await axiosClient.get(`/users/uploads/images/${url}`, {
        responseType: "arraybuffer",
      });

      if (response.status === 200) {
        const base64String = fromByteArray(new Uint8Array(response.data));
        const mimeType = getMimeType(url);
        setIsLoading(false);
        return `data:${mimeType};base64,${base64String}`;
      } else {
        console.log("Non-200 response:", response.status);
      }
      return null;
    } catch (error: any) {
      if (error.networkError === "TIMEOUT") {
        console.warn("Profile image request timeout");
      } else if (error.networkError === "NO_INTERNET") {
        console.warn("No internet connection - cannot load profile image");
      } else {
        console.error("Error fetching profile image: ", error);
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  return { getProfileImage, isLoading };
};

export default useGetProfileImage;
