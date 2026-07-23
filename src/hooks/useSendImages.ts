import { useCallback, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNetwork } from "@/src/context/NetworkContext";
import conversationStore from "../zustand/conversationStore";
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
  const { selectedConversation, bumpRefreshSignal } = conversationStore();

  const sendImages = useCallback(
    async (images: AttachedImage[]): Promise<boolean> => {
      if (!isConnected) {
        console.error("No internet connection");
        return false;
      }

      if (!selectedConversation || !authState?.token) {
        console.error("Missing selectedConversation or auth token");
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
        images.forEach((image) => {
          formData.append("messageImages", {
            uri: image.uri,
            name: image.name,
            type: image.type,
          } as any);
        });

        // Upload images
        const response = await axios.post(
          `${API_URL}/conversations/${selectedConversation.conversationId}/upload`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${authState.token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );

        if (response.data?.success) {
          // Unlike a text send, the upload response only returns a
          // messageId (server-normalized filenames aren't echoed back), so
          // there isn't enough to construct the message locally -- signal
          // useGetMessages to refetch instead of an optimistic prepend.
          bumpRefreshSignal();
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
    [isConnected, selectedConversation, authState?.token, bumpRefreshSignal]
  );

  return { sendImages, isLoading };
};
