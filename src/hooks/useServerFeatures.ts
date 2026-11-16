import { useCallback, useEffect, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axiosClient from "../utils/axiosClient";
import configStore from "../zustand/configStore";
import { useAppStateListener } from "../context/AppStateContext";

const STORAGE_KEY = "server_features:v1";

// Loads GET /config's feature list once per session. The last known list is
// kept in AsyncStorage so the message actions show straight away on the
// next launch (and offline); a failed fetch is retried when the app comes
// back to the foreground. Mount once, inside the signed-in layout.
const useServerFeatures = () => {
  const setFeatures = configStore((state) => state.setFeatures);
  const fetched = useRef(false);
  const inFlight = useRef(false);

  const load = useCallback(async () => {
    if (fetched.current || inFlight.current) return;
    inFlight.current = true;
    try {
      const res = await axiosClient.get("/config");
      const features = res.data?.features;
      if (Array.isArray(features)) {
        const list = features.filter((f): f is string => typeof f === "string");
        setFeatures(list);
        fetched.current = true;
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list)).catch(() => {});
      }
    } catch (error: any) {
      console.log("Failed to load server features:", error?.message);
    } finally {
      inFlight.current = false;
    }
  }, [setFeatures]);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        // A fresh fetch that already landed wins over the stored copy
        if (!raw || fetched.current) return;
        const stored = JSON.parse(raw);
        if (Array.isArray(stored)) setFeatures(stored);
      })
      .catch(() => {});
    load();
  }, [load, setFeatures]);

  useAppStateListener(load);
};

export default useServerFeatures;
