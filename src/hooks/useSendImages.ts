import { useCallback, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNetwork } from "@/src/context/NetworkContext";
import FriendStore from "../zustand/friendStore";
import { API_URL } from "../constants/api";

interface AttachedImage {
  uri: string;
  name: string;
  type: string;
  size: number;
}

export const useSendImages = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { authState } = useAuth();
  const { isConnected } = useNetwork();
  const { selectedFriend, setShouldRender } = FriendStore();

  const sendImages = useCallback(
    async (images: AttachedImage[]): Promise<boolean> => {
      if (!isConnected) {
        console.error("No internet connection");
        return false;
      }

      if (!selectedFriend || !authState?.token) {
        console.error("Missing selectedFriend or auth token");
        return false;
      }

      if (images.length === 0) {
        console.error("No images to send");
        return false;
      }

      try {
        setIsLoading(true);

        // Create FormData
        const formData = new FormData();
        images.forEach((image, index) => {
          formData.append("messageImages", {
            uri: image.uri,
            name: image.name,
            type: image.type,
          } as any);
        });

        // Upload images
        const response = await axios.post(
          `${API_URL}/messages/upload/${selectedFriend._id}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${authState.token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );

        if (response.data?.success) {
          // Trigger message refresh to show uploaded images
          setShouldRender();
          setIsLoading(false);
          return true;
        } else {
          console.error("Upload failed:", response.data);
          setIsLoading(false);
          return false;
        }
      } catch (error) {
        console.error("Error sending images:", error);
        setIsLoading(false);
        return false;
      }
    },
    [isConnected, selectedFriend, authState?.token, setShouldRender]
  );

  return { sendImages, isLoading };
};
