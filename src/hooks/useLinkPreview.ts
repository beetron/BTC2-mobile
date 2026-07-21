import { useEffect, useState } from "react";
import axiosClient from "@/src/utils/axiosClient";
import { useNetwork } from "@/src/context/NetworkContext";

export interface LinkPreviewData {
  url: string;
  title: string | null;
  description: string | null;
  image: string | null; // absolute http(s) OG image URL, or null
  siteName: string | null;
}

// Module-level (shared across all card instances for the JS session) --
// the backend already caches per-URL in Mongo, so this just avoids repeat
// network round-trips while scrolling. Cleared on app reload; intentionally
// not persisted to AsyncStorage.
const previewCache = new Map<string, LinkPreviewData>();
const pendingRequests = new Map<string, Promise<LinkPreviewData | null>>();

const fetchPreview = (url: string): Promise<LinkPreviewData | null> => {
  const existing = pendingRequests.get(url);
  if (existing) return existing;

  const request = axiosClient
    .get("/link-preview", { params: { url } })
    .then((res) => {
      const data = res.data as LinkPreviewData;
      previewCache.set(url, data);
      return data;
    })
    .catch((error) => {
      // Don't cache failures -- a transient blip should be retryable on a
      // later mount rather than stuck for the rest of the session.
      console.log(
        "Error fetching link preview:",
        error.response?.data?.error || error.message
      );
      return null;
    })
    .finally(() => {
      pendingRequests.delete(url);
    });

  pendingRequests.set(url, request);
  return request;
};

const useLinkPreview = (url: string | null | undefined) => {
  const { isConnected } = useNetwork();
  const [data, setData] = useState<LinkPreviewData | null>(
    url ? previewCache.get(url) ?? null : null
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);

  useEffect(() => {
    if (!url) {
      setData(null);
      setIsLoading(false);
      setIsError(false);
      return;
    }

    const cached = previewCache.get(url);
    if (cached) {
      setData(cached);
      setIsLoading(false);
      setIsError(false);
      return;
    }

    if (!isConnected) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setIsError(false);

    fetchPreview(url).then((result) => {
      if (cancelled) return;
      setIsLoading(false);
      if (result) {
        setData(result);
      } else {
        setIsError(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [url, isConnected]);

  const hasContent = !!(data && (data.title || data.description || data.image));

  return { data, isLoading, isError, hasContent };
};

export default useLinkPreview;
