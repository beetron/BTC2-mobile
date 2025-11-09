import { useState, useCallback } from "react";
import messaging from "@react-native-firebase/messaging";
import * as SecureStore from "expo-secure-store";
import * as Device from "expo-device";
import axiosClient from "@/src/utils/axiosClient";
import { useAuth } from "@/src/context/AuthContext";
import { Alert } from "react-native";
import { useNetwork } from "@/src/context/NetworkContext";

const FCM_TOKEN = "fcm_token";

export default function useFcmToken() {
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const { authState } = useAuth();
  const { isConnected } = useNetwork();

  // Get mobile device info
  const getDeviceInfo = async () => {
    console.log("Device manufacturer:", Device.manufacturer);
    console.log("Device model name:", Device.modelName);

    const deviceManufacturer = Device.manufacturer || "Unknown Manufacturer";
    const deviceModel = Device.modelName || "Unknown Model";

    return `${deviceManufacturer}:${deviceModel}`;
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

        const response = await axiosClient.put("/users/fcm/register", {
          token,
          device: deviceInfo,
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
      // Request client for notification permission
      const permStatus = await messaging().requestPermission();
      console.log("Notification permission status: ", permStatus);

      // Get FCM token
      const token = await messaging().getToken();

      if (token) {
        // Save FCM token to SecureStore
        await SecureStore.setItemAsync(FCM_TOKEN, token);
        setFcmToken(token);
        return token;
      }
      return null;
    } catch (error) {
      console.error("Error generating FCM token: ", error);
      Alert.alert("Error generating FCM token");
      return null;
    }
  }, []);

  /////////////////////////////////////////////
  // Token registration
  /////////////////////////////////////////////
  const manageFcmToken = useCallback(async () => {
    if (!authState?.authenticated) {
      return;
    }

    try {
      // First check notification permission status
      // Permission status needs re-checking when app is re-installed
      const permStatus = await messaging().hasPermission();
      console.log("Current notification permission status:", permStatus);

      // If permission not granted, generate new token which will trigger permission request
      if (
        permStatus === messaging.AuthorizationStatus.NOT_DETERMINED ||
        permStatus === messaging.AuthorizationStatus.DENIED
      ) {
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
      Alert.alert("Failed managing FCM token");
    }
  }, [authState?.authenticated, generateNewFcmToken, registerFcmToken]);

  return { fcmToken, isRegistering, manageFcmToken };
}
