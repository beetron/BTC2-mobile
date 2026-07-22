import axiosClient from "@/src/utils/axiosClient";
import { fromByteArray } from "base64-js";
import { useState } from "react";
import { Alert } from "react-native";
import { useNetwork } from "@/src/context/NetworkContext";

const getMimeType = (url: string): string => {
  const extension = url.toLowerCase().split(".").pop();

  switch (extension) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "heic":
      return "image/heic";
    default:
      return "image/jpeg";
  }
};

// Module-level (not per-hook-instance) so every screen/component sharing
// this hook shares one cache. Keyed by filename -- profile images get a
// brand-new UUID filename every time they're changed (see
// resizeImage/updateProfileImage on the backend), so a cached filename
// never goes stale; there's nothing to invalidate.
const imageCache = new Map<string, string>();
// Dedupes concurrent requests for the same filename (e.g. the same friend
// showing up in both the conversation list and a group member list at
// once) so only one network request fires instead of one per caller.
const inFlightRequests = new Map<string, Promise<string | null>>();

const useGetProfileImage = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { isConnected } = useNetwork();

  const getProfileImage = async (url: string) => {
    if (!url) return null;

    const cached = imageCache.get(url);
    if (cached) return cached;

    const inFlight = inFlightRequests.get(url);
    if (inFlight) return inFlight;

    const request = (async () => {
      try {
        setIsLoading(true);

        if (!isConnected) {
          console.warn("No internet connection - cannot load profile image");
          return null;
        }

        const response = await axiosClient.get(`/users/uploads/images/${url}`, {
          responseType: "arraybuffer",
        });

        if (response.status === 200) {
          const base64String = fromByteArray(new Uint8Array(response.data));
          const mimeType = getMimeType(url);
          const dataUri = `data:${mimeType};base64,${base64String}`;
          imageCache.set(url, dataUri);
          return dataUri;
        } else {
          console.log("Non-200 response:", response.status);
        }
        return null;
      } catch (error: any) {
        if (error.networkError === "TIMEOUT") {
          console.warn("Profile image request timeout");
        } else if (error.networkError === "NO_INTERNET") {
          console.warn("No internet connection - cannot load profile image");
        } else {
          console.error("Error fetching profile image: ", error);
        }
        return null;
      } finally {
        setIsLoading(false);
        inFlightRequests.delete(url);
      }
    })();

    inFlightRequests.set(url, request);
    return request;
  };
  return { getProfileImage, isLoading };
};

export default useGetProfileImage;
