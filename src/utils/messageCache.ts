import AsyncStorage from "@react-native-async-storage/async-storage";

export interface Message {
  _id: string;
  senderId: string;
  nickname?: string; // from conversationStore for display
  message?: string;
  imageFiles?: string[];
  createdAt: string;
  conversationId?: string;
  updatedAt?: string;
}

export interface CachedMessages {
  ts: number; // timestamp when cached
  messages: Message[];
}

const CACHE_PREFIX = "msg_cache";
// v2: keyed by conversationId instead of friendId, following the backend's
// migration to a unified Conversation model. v1 entries are intentionally
// never read again rather than migrated.
const CACHE_VERSION = "v2";

/**
 * Generate a unique cache key for a user+conversation pair
 * Format: msg_cache:v2:{userId}:{conversationId}
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
 * Clear all message caches for a user
 * Useful when user logs out
 */
export const clearAllUserMessageCaches = async (
  userId: string
): Promise<void> => {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const userCacheKeys = allKeys.filter((key) =>
      key.startsWith(`${CACHE_PREFIX}:${CACHE_VERSION}:${userId}:`)
    );
    if (userCacheKeys.length > 0) {
      await AsyncStorage.multiRemove(userCacheKeys);
    }
  } catch (error) {
    console.warn("clearAllUserMessageCaches failed:", error);
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
