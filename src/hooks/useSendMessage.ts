import { useState } from "react";
import axiosClient from "../utils/axiosClient";
import conversationStore, { Message, isConversationOpen } from "../zustand/conversationStore";
import { useAuth } from "../context/AuthContext";
import { Alert } from "react-native";
import { useNetwork } from "@/src/context/NetworkContext";
import { useTranslation } from "./useTranslation";
import { saveCurrentMessagesToCache } from "../utils/messageCache";
import useClientMessageId from "./useClientMessageId";

// The API answers 400 "Cannot reply to a deleted message" / "Cannot reply
// to that message" when the quoted message is gone. Shared with photo
// uploads (useSendImages).
export const isReplyTargetGone = (e: any) =>
  e?.response?.status === 400 &&
  /cannot reply to/i.test(String(e?.response?.data?.error ?? ""));

const useSendMessage = () => {
  const { authState } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { selectedConversation, upsertMessages, clearComposer } =
    conversationStore();
  const { isConnected } = useNetwork();
  const { t } = useTranslation();
  const { idFor, settle } = useClientMessageId();

  // Resolves true only when the message was accepted by the server, so the
  // caller can restore the input text on any failure path. replyToId makes
  // it a quote reply.
  const sendMessage = async (
    message: string,
    replyToId?: string
  ): Promise<boolean> => {
    // Sending the same text to the same chat again after an unclear failure
    // reuses its clientMessageId, so the server doesn't store it twice
    const conversationKey = selectedConversation?.conversationId ?? "";
    const retryKey = `${conversationKey}|${replyToId ?? ""}|${message}`;
    try {
      setIsLoading(true);

      if (!isConnected) {
        Alert.alert(t("errors.noInternetTitle"), t("errors.noInternetSendMessages"));
        setIsLoading(false);
        return false;
      }

      if (authState?.authenticated && selectedConversation && message) {
        const conversationId = selectedConversation.conversationId;
        const clientMessageId = idFor(retryKey);
        const res = await axiosClient.post(`/conversations/${conversationId}/messages`, {
          message,
          ...(replyToId ? { replyToId } : {}),
          ...(clientMessageId ? { clientMessageId } : {}),
        });
        settle(retryKey);
        if (res.status === 200 && authState.user) {
          // The response carries the stored message (server _id, createdAt
          // and, for a reply, the replyTo preview). Upserting by _id means a
          // change sync that races this response can't add a second copy.
          const stored: Message = res.data.message ?? {
            _id: res.data.messageId,
            senderId: authState.user._id,
            message,
            createdAt: new Date().toISOString(),
            conversationId,
          };
          // Left the chat while this was sending: it was still sent, and
          // shows when that chat is opened again
          if (isConversationOpen(conversationId)) {
            upsertMessages([stored]);
            saveCurrentMessagesToCache(authState.user._id, conversationId);
          }
          return true;
        }
        Alert.alert(t("common.error"), t("conversation.sendMessageFailed"));
      }
      return false;
    } catch (e: any) {
      settle(retryKey, e);
      if (e.networkError === "TIMEOUT") {
        // It may have been stored anyway; the server skips the sender's own
        // sockets, so reload the chat to show it if so
        conversationStore.getState().bumpRefreshSignal();
        Alert.alert(
          t("errors.connectionTimeoutTitle"),
          t("errors.connectionTimeoutMessage")
        );
      } else if (e.networkError === "NO_INTERNET") {
        // Already alerted in pre-flight check
      } else if (replyToId && isReplyTargetGone(e)) {
        // The quoted message was deleted for everyone (or removed)
        // meanwhile. Drop the reply; the caller restores the text so it can
        // be sent as a plain message.
        console.log("Reply rejected: ", e.response?.data?.error);
        clearComposer();
        Alert.alert(t("common.error"), t("conversation.composer.replyTargetGone"));
      } else {
        console.log("Error: ", e.response?.data?.error || e.message);
        Alert.alert(t("common.error"), t("conversation.sendMessageFailed"));
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  return { sendMessage, isLoading };
};

export default useSendMessage;
