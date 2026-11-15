import AsyncStorage from "@react-native-async-storage/async-storage";

import conversationStore, { type Message } from "../zustand/conversationStore";

// One message shape for the store and the cache
export type { Message };

export interface CachedMessages {
  ts: number; // timestamp when cached
  messages: Message[];
}

const CACHE_PREFIX = "msg_cache";
// v2: keyed by conversationId instead of friendId, following the backend's
// migration to a unified Conversation model.
// v3: API 2.0 messages (tombstones, replyTo, editedAt). A v2 entry would
// still show the text of messages deleted for everyone, so older entries
// are never read again rather than migrated.
const CACHE_VERSION = "v3";

/**
 * Generate a unique cache key for a user+conversation pair
 * Format: msg_cache:v3:{userId}:{conversationId}
 */
export const makeCacheKey = (
  userId: string,
  conversationId: string
): string => {
  return `${CACHE_PREFIX}:${CACHE_VERSION}:${userId}:${conversationId}`;
};

/**
 * Save messages to AsyncStorage with timestamp
 * Keeps only the most recent maxMessages to avoid bloating storage
 */
export const saveMessagesToCache = async (
  userId: string,
  conversationId: string,
  messages: Message[],
  maxMessages = 500
): Promise<void> => {
  try {
    const key = makeCacheKey(userId, conversationId);
    // Keep only the most recent maxMessages (assume already sorted newest first)
    const truncated = messages.slice(0, maxMessages);
    const payload: CachedMessages = {
      ts: Date.now(),
      messages: truncated,
    };
    await AsyncStorage.setItem(key, JSON.stringify(payload));
  } catch (error) {
    console.warn("saveMessagesToCache failed:", error);
    // Silently fail; caching is optional
  }
};

/**
 * Save the open conversation's messages as the store holds them right now,
 * e.g. after an upsert from a send, edit, delete or change sync
 */
export const saveCurrentMessagesToCache = async (
  userId: string | undefined
): Promise<void> => {
  const { selectedConversation, messages } = conversationStore.getState();
  if (!userId || !selectedConversation) return;
  await saveMessagesToCache(userId, selectedConversation.conversationId, messages);
};

/**
 * Load messages from AsyncStorage cache
 * Returns null if cache doesn't exist or is invalid
 */
export const loadMessagesFromCache = async (
  userId: string,
  conversationId: string
): Promise<CachedMessages | null> => {
  try {
    const key = makeCacheKey(userId, conversationId);
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as CachedMessages;
    // Validate structure
    if (!parsed.ts || !Array.isArray(parsed.messages)) {
      return null;
    }
    return parsed;
  } catch (error) {
    console.warn("loadMessagesFromCache failed:", error);
    return null;
  }
};

/**
 * Delete cached messages for a specific conversation
 */
export const removeMessagesCache = async (
  userId: string,
  conversationId: string
): Promise<void> => {
  try {
    const key = makeCacheKey(userId, conversationId);
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.warn("removeMessagesCache failed:", error);
  }
};

/**
 * Delete every cached message on the device, for every user and every
 * cache version (old v1 entries included). Called on logout: AsyncStorage
 * is not encrypted, so cached conversations must not outlive the session,
 * especially on a device someone else may sign in to next.
 */
export const clearAllMessageCaches = async (): Promise<void> => {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const cacheKeys = allKeys.filter((key) =>
      key.startsWith(`${CACHE_PREFIX}:`)
    );
    if (cacheKeys.length > 0) {
      await AsyncStorage.multiRemove(cacheKeys);
    }
  } catch (error) {
    console.warn("clearAllMessageCaches failed:", error);
  }
};

/**
 * Get cache age in milliseconds
 */
export const getCacheAge = (cached: CachedMessages | null): number | null => {
  if (!cached) return null;
  return Date.now() - cached.ts;
};

/**
 * Check if cache is older than X milliseconds (default 1 hour)
 */
export const isCacheStale = (
  cached: CachedMessages | null,
  maxAge = 1000 * 60 * 60 // 1 hour
): boolean => {
  if (!cached) return true;
  const age = getCacheAge(cached);
  return age === null || age > maxAge;
};
