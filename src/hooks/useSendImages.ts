import { useCallback, useState } from "react";
import { Alert } from "react-native";
import axiosClient from "../utils/axiosClient";
import { useAuth } from "../context/AuthContext";
import { useNetwork } from "@/src/context/NetworkContext";
import conversationStore, { isConversationOpen } from "../zustand/conversationStore";
import { saveCurrentMessagesToCache } from "../utils/messageCache";
import { isReplyTargetGone } from "./useSendMessage";
import { useTranslation } from "./useTranslation";

// Several photos over a slow connection take well over axiosClient's 10s
const UPLOAD_TIMEOUT_MS = 120000;

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
        Alert.alert(t("errors.noInternetTitle"), t("errors.noInternetSendMessages"));
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

        // Through axiosClient (auth header, X-Socket-Id, and refresh-and-
        // retry on an expired access token, which plain axios skipped so
        // the upload just failed). Photos take longer than the default 10s.
        const conversationId = selectedConversation.conversationId;
        const response = await axiosClient.post(
          `/conversations/${conversationId}/upload`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
            timeout: UPLOAD_TIMEOUT_MS,
          }
        );

        if (response.data?.success) {
          // Left the chat during the upload: the photos were still sent and
          // show when that chat is opened again
          if (isConversationOpen(conversationId)) {
            if (response.data.message) {
              // The response carries the stored message (server filenames
              // and, for a reply, the replyTo preview)
              upsertMessages([response.data.message]);
              saveCurrentMessagesToCache(authState.user?._id, conversationId);
            } else {
              bumpRefreshSignal();
            }
          }
          setIsLoading(false);
          return true;
        } else {
          console.error("Upload failed:", response.data);
          Alert.alert(t("common.error"), t("conversation.sendPhotosFailed"));
          setIsLoading(false);
          return false;
        }
      } catch (error: any) {
        if (replyToId && isReplyTargetGone(error)) {
          clearComposer();
          Alert.alert(t("common.error"), t("conversation.composer.replyTargetGone"));
        } else if (error?.networkError === "TIMEOUT") {
          Alert.alert(
            t("errors.connectionTimeoutTitle"),
            t("errors.connectionTimeoutMessage")
          );
        } else {
          console.error("Error sending images:", error);
          Alert.alert(t("common.error"), t("conversation.sendPhotosFailed"));
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
