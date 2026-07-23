import { useState, useEffect, useCallback } from "react";
import axiosClient from "../utils/axiosClient";
import conversationStore from "../zustand/conversationStore";
import { useAuth } from "../context/AuthContext";
import { useNetwork } from "@/src/context/NetworkContext";
import {
  loadMessagesFromCache,
  saveMessagesToCache,
  Message,
} from "../utils/messageCache";

const useGetMessages = () => {
  const { authState } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false); // separate state for syncing while showing cached
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const {
    selectedConversation,
    messages,
    setMessages,
    appendOlderMessages,
    nextCursor,
    setNextCursor,
    setLatestMessageId,
    refreshSignal,
  } = conversationStore();
  const { isConnected } = useNetwork();

  const getMessages = useCallback(async () => {
    if (!selectedConversation || !authState?.user) return;

    const userId = authState.user._id;
    const conversationId = selectedConversation.conversationId;

    // Load cache first and display immediately
    try {
      const cached = await loadMessagesFromCache(userId, conversationId);
      if (cached && cached.messages && cached.messages.length > 0) {
        setMessages(cached.messages as any);
        setLatestMessageId(cached.messages[0]._id);
        // Don't fully stop loading yet; we'll keep syncing state true while fetching fresh
      } else {
        // No cache, show loading state
        setIsLoading(true);
      }
    } catch (err) {
      console.warn("Failed to read messages cache:", err);
      setIsLoading(true);
    }

    // Fetch fresh first page in background
    try {
      setIsSyncing(true);

      if (!isConnected) {
        setIsLoading(false);
        setIsSyncing(false);
        return;
      }

      const res = await axiosClient.get(
        `/conversations/${conversationId}/messages`
      );
      if (res.status === 200) {
        const freshMessages = res.data.messages;
        setMessages(freshMessages as any);
        setNextCursor(res.data.nextCursor);

        await saveMessagesToCache(userId, conversationId, freshMessages);

        if (freshMessages.length > 0) {
          setLatestMessageId(freshMessages[0]._id);
        } else {
          setLatestMessageId(null);
        }
      } else {
        console.warn("Failed to get fresh messages, status:", res.status);
      }
    } catch (error: any) {
      // Network error: keep cache displayed
      if (error.networkError === "TIMEOUT") {
        console.warn("Message fetch timeout; using cache");
      } else if (error.networkError === "NO_INTERNET") {
        console.log("Offline; showing cached messages");
      } else {
        console.log(
          "Error fetching messages:",
          error.response?.data?.error || error.message
        );
      }
    } finally {
      setIsLoading(false);
      setIsSyncing(false);
    }
  }, [
    authState?.user,
    selectedConversation,
    isConnected,
    setMessages,
    setNextCursor,
    setLatestMessageId,
  ]);

  const loadMore = useCallback(async () => {
    if (!selectedConversation || !nextCursor || isLoadingMore) return;

    const userId = authState?.user?._id;
    const conversationId = selectedConversation.conversationId;

    try {
      setIsLoadingMore(true);

      if (!isConnected) return;

      const res = await axiosClient.get(
        `/conversations/${conversationId}/messages`,
        { params: { cursor: nextCursor } }
      );

      if (res.status === 200) {
        const olderMessages: Message[] = res.data.messages;
        appendOlderMessages(olderMessages as any);
        setNextCursor(res.data.nextCursor);

        if (userId) {
          await saveMessagesToCache(
            userId,
            conversationId,
            [...messages, ...olderMessages]
          );
        }
      }
    } catch (error: any) {
      console.log(
        "Error loading more messages:",
        error.response?.data?.error || error.message
      );
    } finally {
      setIsLoadingMore(false);
    }
  }, [
    selectedConversation,
    nextCursor,
    isLoadingMore,
    isConnected,
    authState?.user?._id,
    messages,
    appendOlderMessages,
    setNextCursor,
  ]);

  useEffect(() => {
    getMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedConversation?.conversationId, refreshSignal]);

  return {
    getMessages,
    loadMore,
    messages,
    isLoading,
    isSyncing,
    isLoadingMore,
    hasMore: !!nextCursor,
  };
};

export default useGetMessages;
