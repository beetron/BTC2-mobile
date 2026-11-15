import { useCallback, useState } from "react";
import { Alert } from "react-native";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNetwork } from "@/src/context/NetworkContext";
import conversationStore from "../zustand/conversationStore";
import { API_URL } from "../constants/api";
import { getCurrentSocketId, SOCKET_ID_HEADER } from "../utils/socketIdentity";
import { saveCurrentMessagesToCache } from "../utils/messageCache";
import { isReplyTargetGone } from "./useSendMessage";
import { useTranslation } from "./useTranslation";

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
  const { t } = useTranslation();
  const { selectedConversation, bumpRefreshSignal, upsertMessages, clearComposer } =
    conversationStore();

  // replyToId makes the upload a quote reply
  const sendImages = useCallback(
    async (images: AttachedImage[], replyToId?: string): Promise<boolean> => {
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
        if (replyToId) formData.append("replyToId", replyToId);

        // Plain axios (multipart), so the X-Socket-Id that axiosClient adds
        // to every other call is added here by hand
        const socketId = getCurrentSocketId();
        const response = await axios.post(
          `${API_URL}/conversations/${selectedConversation.conversationId}/upload`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${authState.token}`,
              "Content-Type": "multipart/form-data",
              ...(socketId ? { [SOCKET_ID_HEADER]: socketId } : {}),
            },
          }
        );

        if (response.data?.success) {
          if (response.data.message) {
            // The response carries the stored message (server filenames
            // and, for a reply, the replyTo preview)
            upsertMessages([response.data.message]);
            saveCurrentMessagesToCache(authState.user?._id);
          } else {
            bumpRefreshSignal();
          }
          setIsLoading(false);
          return true;
        } else {
          console.error("Upload failed:", response.data);
          setIsLoading(false);
          return false;
        }
      } catch (error) {
        if (replyToId && isReplyTargetGone(error)) {
          clearComposer();
          Alert.alert(t("common.error"), t("conversation.composer.replyTargetGone"));
        } else {
          console.error("Error sending images:", error);
        }
        setIsLoading(false);
        return false;
      }
    },
    [
      isConnected,
      selectedConversation,
      authState?.token,
      authState?.user?._id,
      bumpRefreshSignal,
      upsertMessages,
      clearComposer,
      t,
    ]
  );

  return { sendImages, isLoading };
};
