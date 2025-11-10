import { useState, useEffect, useCallback } from "react";
import axiosClient from "../utils/axiosClient";
import FriendStore from "../zustand/friendStore";
import { useAuth } from "../context/AuthContext";
import { Alert } from "react-native";
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
  const { selectedFriend, messages, setMessages, shouldRender, setMessageId } =
    FriendStore();
  const { isConnected } = useNetwork();

  const getMessages = useCallback(async () => {
    if (!selectedFriend || !authState?.user) return;

    const userId = authState.user._id;
    const friendId = selectedFriend._id;

    // 1) Load cache first and display immediately
    try {
      const cached = await loadMessagesFromCache(userId, friendId);
      if (cached && cached.messages && cached.messages.length > 0) {
        setMessages(cached.messages as any);
        // Set the most recent message ID for useDeleteMessages hook
        const mostRecentMessageId = cached.messages[0];
        setMessageId(mostRecentMessageId._id);
        // Don't fully stop loading yet; we'll keep syncing state true while fetching fresh
      } else {
        // No cache, show loading state
        setIsLoading(true);
      }
    } catch (err) {
      console.warn("Failed to read messages cache:", err);
      setIsLoading(true);
    }

    // 2) Fetch fresh messages in background
    try {
      setIsSyncing(true);

      if (!isConnected) {
        // Offline: just use cache (already set above)
        setIsLoading(false);
        setIsSyncing(false);
        return;
      }

      const res = await axiosClient.get(`/messages/get/${friendId}`);
      if (res.status === 200) {
        const freshMessages = res.data;
        // Replace messages with fresh data
        setMessages(freshMessages as any);

        // Save to cache for next time
        await saveMessagesToCache(userId, friendId, freshMessages);

        // Set the most recent message ID for useDeleteMessages hook
        if (freshMessages.length > 0) {
          const mostRecentMessageId = freshMessages[0];
          setMessageId(mostRecentMessageId._id);
        } else {
          setMessageId(null);
        }
      } else {
        console.warn("Failed to get fresh messages, status:", res.status);
      }
    } catch (error: any) {
      // Network error: keep cache displayed
      if (error.networkError === "TIMEOUT") {
        // Timeout after showing cache is okay; don't alert, just stop syncing
        console.warn("Message fetch timeout; using cache");
      } else if (error.networkError === "NO_INTERNET") {
        // Offline; cache already shown above
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
  }, [authState?.user, selectedFriend, isConnected, setMessages, setMessageId]);

  useEffect(() => {
    getMessages();
  }, [shouldRender, getMessages]);

  return { getMessages, messages, isLoading, isSyncing };
};

export default useGetMessages;
