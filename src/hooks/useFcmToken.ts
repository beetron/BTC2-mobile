import { useState, useCallback, useRef } from "react";
import { getMessaging, getToken } from "@react-native-firebase/messaging";
import * as Notifications from "expo-notifications";
import * as SecureStore from "expo-secure-store";
import * as Device from "expo-device";
import axiosClient from "@/src/utils/axiosClient";
import { useAuth } from "@/src/context/AuthContext";
import { Alert } from "react-native";
import { useNetwork } from "@/src/context/NetworkContext";
import { useTranslation } from "@/src/hooks/useTranslation";

const FCM_TOKEN = "fcm_token";
const DEVICE_ID = "device_id";

function generateUuidV4(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export default function useFcmToken() {
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const { authState } = useAuth();
  const { isConnected } = useNetwork();
  const { t } = useTranslation();
  // Guards against overlapping registration attempts -- manageFcmToken runs
  // on mount and again on every app-foreground event, so a slow backend
  // response to a previous call shouldn't get a second one stacked on top.
  const isManagingRef = useRef(false);

  // Get mobile device info
  const getDeviceInfo = async () => {
    console.log("Device manufacturer:", Device.manufacturer);
    console.log("Device model name:", Device.modelName);

    const deviceManufacturer = Device.manufacturer || "Unknown Manufacturer";
    const deviceModel = Device.modelName || "Unknown Model";

    return `${deviceManufacturer}:${deviceModel}`;
  };

  // Stable per-install identifier so the backend can replace this device's
  // FCM token instead of accumulating a duplicate when it rotates (e.g.
  // after a cache clear). Persisted in SecureStore, same as fcm_token.
  const getOrCreateDeviceId = async () => {
    const existing = await SecureStore.getItemAsync(DEVICE_ID);
    if (existing) {
      return existing;
    }
    const newDeviceId = generateUuidV4();
    await SecureStore.setItemAsync(DEVICE_ID, newDeviceId);
    return newDeviceId;
  };
  /////////////////////////////////////////////
  // Register or Renew FCM token with backend
  /////////////////////////////////////////////
  const registerFcmToken = useCallback(
    async (token: string) => {
      if (!authState?.authenticated) {
        return false;
      }

      if (!isConnected) {
        console.warn(
          "No internet connection - FCM registration will retry later"
        );
        return false;
      }

      try {
        setIsRegistering(true);
        const deviceInfo = await getDeviceInfo();
        const deviceId = await getOrCreateDeviceId();

        const response = await axiosClient.put("/users/fcm/register", {
          token,
          device: deviceInfo,
          deviceId,
        });

        if (response.status === 200) {
          console.log("FCM token registered successfully");
          return true;
        } else {
          throw new Error("Failed to register FCM token");
        }
      } catch (error: any) {
        console.error("Error registering FCM token with backend: ", error);

        if (error.networkError === "TIMEOUT") {
          console.warn("FCM registration timeout - will retry");
        } else if (error.networkError === "NO_INTERNET") {
          console.warn(
            "No internet for FCM registration - will retry when online"
          );
        }
        return false;
      } finally {
        setIsRegistering(false);
      }
    },
    [authState?.authenticated, isConnected]
  );

  /////////////////////////////////////////////
  // Generate new FCM token
  /////////////////////////////////////////////
  const generateNewFcmToken = useCallback(async () => {
    try {
      const messagingInstance = getMessaging();

      // Request client for notification permission
      const { status } = await Notifications.requestPermissionsAsync();
      console.log("Notification permission status: ", status);

      // Get FCM token
      const token = await getToken(messagingInstance);

      if (token) {
        // Save FCM token to SecureStore
        await SecureStore.setItemAsync(FCM_TOKEN, token);
        setFcmToken(token);
        return token;
      }
      return null;
    } catch (error) {
      console.error("Error generating FCM token: ", error);
      Alert.alert(t("fcm.tokenGenerationFailed"));
      return null;
    }
  }, [t]);

  /////////////////////////////////////////////
  // Token registration
  /////////////////////////////////////////////
  const manageFcmToken = useCallback(async () => {
    if (!authState?.authenticated) {
      return;
    }

    if (isManagingRef.current) {
      return;
    }
    isManagingRef.current = true;

    try {
      // First check notification permission status
      // Permission status needs re-checking when app is re-installed
      const { status } = await Notifications.getPermissionsAsync();
      console.log("Current notification permission status:", status);

      // If permission not granted, generate new token which will trigger permission request
      if (status === "undetermined" || status === "denied") {
        console.log(
          "Notification permission not granted, requesting permission..."
        );
        const newToken = await generateNewFcmToken();
        if (newToken) {
          await registerFcmToken(newToken);
        }
        return;
      }

      // Check FCM token in SecureStore
      const storedFcmToken = await SecureStore.getItemAsync(FCM_TOKEN);

      if (storedFcmToken) {
        console.log("Found SecureStored FCM token");
        setFcmToken(storedFcmToken);

        // Update existing token to backend
        await registerFcmToken(storedFcmToken);
      } else {
        // If new device with no existing token, generate new token and register
        console.log("No FCM token found, generating new token");
        const newToken = await generateNewFcmToken();
        if (newToken) {
          await registerFcmToken(newToken);
        }
      }
    } catch (error) {
      console.error("Error managing FCM token: ", error);
      Alert.alert(t("fcm.manageFailed"));
    } finally {
      isManagingRef.current = false;
    }
  }, [authState?.authenticated, generateNewFcmToken, registerFcmToken, t]);

  return { fcmToken, isRegistering, manageFcmToken };
}
