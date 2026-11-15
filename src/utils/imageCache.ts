import { Image } from "expo-image";

/**
 * Remove every photo expo-image has saved on the device (disk and memory).
 * Called on logout, next to clearAllMessageCaches: the disk cache keeps a
 * copy of each message photo that was shown, including photos the server
 * has since expired, so they must not outlive the session. Never throws.
 */
export const clearImageCaches = async (): Promise<void> => {
  try {
    await Promise.all([Image.clearDiskCache(), Image.clearMemoryCache()]);
  } catch (error) {
    console.warn("clearImageCaches failed:", error);
  }
};
