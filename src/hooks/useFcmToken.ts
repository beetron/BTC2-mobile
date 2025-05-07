import { useState, useCallback } from "react";
import messaging from "@react-native-firebase/messaging";
import * as SecureStore from "expo-secure-store";
import * as Device from "expo-device";
import axiosClient from "@/src/utils/axiosClient";
import { useAuth } from "@/src/context/AuthContext";
import { Alert } from "react-native";

const FCM_TOKEN = "fcm_token";
const FCM_TOKEN_TIMESTAMP = "fcm_token_timestamp";

export default function useFcmToken() {
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [error] = useState<string | null>(null);
  const { authState } = useAuth();

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

      try {
        setIsRegistering(true);
        const deviceInfo = await getDeviceInfo();

        const response = await axiosClient.put("/users/fcm/register", {
          token,
          device: deviceInfo,
        });

        if (response.status === 200) {
          // Store and update token timestamp
          await SecureStore.setItemAsync(
            FCM_TOKEN_TIMESTAMP,
            Date.now().toString()
          );
          console.log("FCM token registered successfully");
          return true;
        } else {
          throw new Error("Failed to register FCM token");
        }
      } catch (error) {
        console.error("Error registering FCM token with backend: ", error);
        Alert.alert("Failed to register FCM token");
        return false;
      } finally {
        setIsRegistering(false);
      }
    },
    [authState?.authenticated]
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
      // Check FCM token in SecureStore
      const storedFcmToken = await SecureStore.getItemAsync(FCM_TOKEN);
      const storedFcmTokenTimestamp =
        await SecureStore.getItemAsync(FCM_TOKEN_TIMESTAMP);

      if (storedFcmToken) {
        console.log("Found SecureStored FCM token");
        setFcmToken(storedFcmToken);

        // Check if token is not expired based on backend policy (e.g. 14 days)
        const shouldRenew = shouldRenewFcmToken(storedFcmTokenTimestamp);

        if (shouldRenew) {
          // Register existing token to backend
          const success = await registerFcmToken(storedFcmToken);

          // if registration failed, get new token
          if (!success) {
            console.log(
              "Failed to register existing FCM token, getting new token"
            );
            const newToken = await generateNewFcmToken();
            if (newToken) {
              await registerFcmToken(newToken);
            }
          }
        }
      } else {
        // If new device with no existing token, get new token and register
        console.log("No FCM token found, getting new token");
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

  /////////////////////////////////////////////
  // Renew FCM token if x days have passed since last registration
  /////////////////////////////////////////////
  const shouldRenewFcmToken = (timestamp: string | null): boolean => {
    if (!timestamp) {
      return true;
    }
    const lastRegistered = parseInt(timestamp, 10);
    const now = Date.now();
    const daysPassed = (now - lastRegistered) / (1000 * 60 * 60 * 24);

    console.log("Days passed since last FCM token registration: ", daysPassed);
    // Renew if more than 7 days have passed
    return daysPassed > 7;
  };

  return { fcmToken, isRegistering, error, manageFcmToken };
}
