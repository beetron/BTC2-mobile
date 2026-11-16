import { useState, useEffect, useCallback, useRef } from "react";
import axiosClient from "../utils/axiosClient";
import conversationStore, {
  Message,
  isConversationOpen,
  mergeMessages,
} from "../zustand/conversationStore";
import { hasFeature } from "../zustand/configStore";
import { useAuth } from "../context/AuthContext";
import { useNetwork } from "@/src/context/NetworkContext";
import {
  loadMessagesFromCache,
  saveMessagesToCache,
  saveCurrentMessagesToCache,
} from "../utils/messageCache";

// Tombstones (deleted for everyone) are left out of history by default;
// ask for them so the "This message was deleted" placeholder can show.
const HISTORY_PARAMS = { includeDeleted: 1 };

// A sync that still has more after this many pages has fallen far enough
// behind that refetching the newest page is cheaper.
const MAX_CHANGE_PAGES = 5;

// Messages already on screen that are newer than a freshly loaded page:
// sent or received while it was loading. The page was read before they
// existed, so replacing the list with it alone would drop them.
const arrivedSince = (current: Message[], page: Message[]): Message[] => {
  const newest = page[0];
  if (!newest) return [];
  const onPage = new Set(page.map((m) => m._id));
  return current.filter(
    (m) =>
      !onPage.has(m._id) &&
      (m.createdAt > newest.createdAt ||
        (m.createdAt === newest.createdAt && m._id > newest._id))
  );
};

// Newest server timestamp on a page: the baseline for the changes feed.
// Server time, so the device clock being off doesn't matter.
const latestServerTime = (messages: Message[]): string | null => {
  let latest: string | null = null;
  for (const m of messages) {
    const t = m.updatedAt ?? m.createdAt;
    if (t && (!latest || t > latest)) latest = t;
  }
  return latest;
};

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
    upsertMessages,
    nextCursor,
    setNextCursor,
    setLatestMessageId,
    setChangesPosition,
    setMarkedReadId,
    refreshSignal,
  } = conversationStore();
  const { isConnected } = useNetwork();
  const syncInFlight = useRef(false);
  const syncAgain = useRef(false);

  const getMessages = useCallback(async () => {
    if (!selectedConversation || !authState?.user) return;

    const userId = authState.user._id;
    const conversationId = selectedConversation.conversationId;

    // Load cache first and display immediately
    try {
      const cached = await loadMessagesFromCache(userId, conversationId);
      if (!isConversationOpen(conversationId)) return;
      if (cached && cached.messages && cached.messages.length > 0) {
        setMessages(cached.messages);
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
        `/conversations/${conversationId}/messages`,
        { params: HISTORY_PARAMS }
      );
      if (res.status === 200) {
        const freshMessages: Message[] = res.data.messages;
        // Cache this chat's fresh page either way, but only show it if the
        // user is still in it
        if (!isConversationOpen(conversationId)) {
          await saveMessagesToCache(userId, conversationId, freshMessages);
          return;
        }
        const kept = arrivedSince(conversationStore.getState().messages, freshMessages);
        setMessages(kept.length > 0 ? mergeMessages(freshMessages, kept) : freshMessages);
        setNextCursor(res.data.nextCursor);
        // Restart the changes feed from this page. With no messages yet
        // there is no server time to start from; the next sync then
        // refetches this page instead.
        setChangesPosition({ since: latestServerTime(freshMessages), cursor: null });
        // Loading the newest page marked it read on the server
        setMarkedReadId(freshMessages[0]?._id ?? null);

        await saveCurrentMessagesToCache(userId, conversationId);
        setLatestMessageId(conversationStore.getState().messages[0]?._id ?? null);
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
    setChangesPosition,
    setMarkedReadId,
  ]);

  // Catches up on messages created, edited or deleted since the last sync
  // (GET .../messages/changes) and merges just those into the list, so
  // older pages the user scrolled to stay loaded. Falls back to refetching
  // the newest page when the API has no changes feed or there's no
  // starting point yet.
  const syncChanges = useCallback(async () => {
    if (!selectedConversation || !authState?.user) return;
    if (syncInFlight.current) {
      syncAgain.current = true;
      return;
    }

    const { changesSince, changesCursor } = conversationStore.getState();
    if (!hasFeature("messageChanges") || (!changesSince && !changesCursor)) {
      await getMessages();
      return;
    }
    if (!isConnected) return;

    const conversationId = selectedConversation.conversationId;
    syncInFlight.current = true;
    try {
      let cursor = changesCursor;
      const since = changesSince;
      for (let page = 0; page < MAX_CHANGE_PAGES; page++) {
        const res = await axiosClient.get(
          `/conversations/${conversationId}/messages/changes`,
          { params: cursor ? { cursor } : { since } }
        );
        // The user may have switched conversations while this was in flight
        if (conversationStore.getState().selectedConversation?.conversationId !== conversationId) {
          return;
        }
        const changed: Message[] = res.data.messages ?? [];
        if (changed.length > 0) upsertMessages(changed);
        // null means nothing changed: keep the previous position
        if (res.data.nextCursor) {
          cursor = res.data.nextCursor;
          setChangesPosition({ cursor });
        }
        if (!res.data.hasMore) {
          if (changed.length > 0) {
            await saveCurrentMessagesToCache(authState.user._id, conversationId);
          }
          return;
        }
      }
      // Still more after MAX_CHANGE_PAGES: start over from the newest page
      await getMessages();
    } catch (error: any) {
      console.log(
        "Error syncing message changes:",
        error.response?.data?.error || error.message
      );
    } finally {
      syncInFlight.current = false;
      if (syncAgain.current) {
        syncAgain.current = false;
        syncChanges();
      }
    }
  }, [
    selectedConversation,
    authState?.user,
    isConnected,
    getMessages,
    upsertMessages,
    setChangesPosition,
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
        { params: { ...HISTORY_PARAMS, cursor: nextCursor } }
      );

      if (res.status === 200 && isConversationOpen(conversationId)) {
        const olderMessages: Message[] = res.data.messages;
        appendOlderMessages(olderMessages);
        setNextCursor(res.data.nextCursor);
        await saveCurrentMessagesToCache(userId, conversationId);
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
    appendOlderMessages,
    setNextCursor,
  ]);

  useEffect(() => {
    getMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedConversation?.conversationId, refreshSignal]);

  return {
    getMessages,
    syncChanges,
    loadMore,
    messages,
    isLoading,
    isSyncing,
    isLoadingMore,
    hasMore: !!nextCursor,
  };
};

export default useGetMessages;
