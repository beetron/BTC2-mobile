import axios from "axios";
import * as SecureStore from "expo-secure-store";
import * as Notifications from "expo-notifications";
import { getMessaging, deleteToken } from "@react-native-firebase/messaging";
import { API_URL } from "@/src/constants/api";
import { clearAllMessageCaches } from "@/src/utils/messageCache";
import { clearImageCaches } from "@/src/utils/imageCache";
import { getCurrentSocketId, SOCKET_ID_HEADER } from "@/src/utils/socketIdentity";

export const JWT_KEY = "jwt";
export const REFRESH_KEY = "refreshToken";
export const USER_KEY = "user";
// Same SecureStore key useFcmToken saves the push token under
const FCM_TOKEN_KEY = "fcm_token";
let isLoggingOut = false;

// Firebase token deletion started by the last logout. A new login must
// wait for it before asking Firebase for a token, or it can get the old
// token back just before it is deleted and register a dead one.
let fcmTokenDeletion: Promise<void> = Promise.resolve();
export const waitForFcmTokenDeletion = () => fcmTokenDeletion;

// Auth state updater function
let authStateUpdater: ((state: any) => void) | null = null;

export const setAuthStateUpdater = (updater: (state: any) => void) => {
  authStateUpdater = updater;
};

console.log("API_URL: ", API_URL);

const axiosClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

export const handleLogout = async () => {
  if (isLoggingOut) {
    console.log("Logout already in progress, skipping");
    return;
  }

  isLoggingOut = true;
  console.log("Starting logout process");

  try {
    const [refreshToken, accessToken, fcmToken] = await Promise.all([
      SecureStore.getItemAsync(REFRESH_KEY),
      SecureStore.getItemAsync(JWT_KEY),
      SecureStore.getItemAsync(FCM_TOKEN_KEY),
    ]);

    // Best-effort server-side cleanup, fired before local state is cleared
    // and not awaited. Bare axios, not axiosClient: the request interceptor
    // rejects everything while isLoggingOut is set, which used to swallow
    // the logout call silently.
    // - /users/fcm/token stops this device getting the old account's
    //   pushes after someone else logs in on it
    // - /auth/logout revokes the refresh token
    if (fcmToken && accessToken) {
      axios
        .delete(`${API_URL}/users/fcm/token`, {
          data: { token: fcmToken },
          headers: { Authorization: `Bearer ${accessToken}` },
          timeout: 10000,
        })
        .catch(() => {});
    }
    if (refreshToken) {
      axios
        .post(`${API_URL}/auth/logout`, { refreshToken }, { timeout: 10000 })
        .catch(() => {});
    }
    // The call above needs a valid access token, so it fails when logout
    // was forced by an expired session. Deleting the token at Firebase
    // covers that: the server's stale entry stops delivering, and the next
    // login registers a fresh token.
    fcmTokenDeletion = deleteToken(getMessaging()).catch(() => {});

    // Clear headers and storage
    delete axiosClient.defaults.headers.common["Authorization"];

    await Promise.all([
      SecureStore.deleteItemAsync(JWT_KEY),
      SecureStore.deleteItemAsync(REFRESH_KEY),
      SecureStore.deleteItemAsync(USER_KEY),
      SecureStore.deleteItemAsync(FCM_TOKEN_KEY),
      // Don't leave the old account's unread count on the app icon
      Notifications.setBadgeCountAsync(0).catch(() => false),
      // Cached messages live in unencrypted AsyncStorage; never fails
      clearAllMessageCaches(),
      // Saved copies of message photos (expo-image disk cache); never fails
      clearImageCaches(),
    ]);

    console.log("Logged out - tokens, message cache and image cache cleared");

    // Immediately update auth state if updater is available
    if (authStateUpdater) {
      authStateUpdater({
        token: null,
        refreshToken: null,
        authenticated: false,
        user: null,
      });
    }
  } catch (error) {
    console.error("Error during logout:", error);
  } finally {
    setTimeout(() => {
      isLoggingOut = false;
    }, 1000);
  }
};

// Requests to these endpoints must never trigger a refresh-and-retry -- a
// 401 from /auth/refresh IS the "refresh failed" signal, not something to
// recover from by refreshing again.
const AUTH_FLOW_PATHS = ["/auth/refresh", "/auth/login", "/auth/signup"];

// Dedupes concurrent refresh attempts -- if several requests 401 around the
// same moment, they all await the same in-flight refresh instead of each
// firing their own /auth/refresh call.
let refreshPromise: Promise<RefreshResult> | null = null;

// - "refreshed": a fresh access token is stored and set on axiosClient
// - "rejected": the server turned the refresh token down (expired, revoked,
//   account gone) or there is none -- the session is over, log out
// - "unavailable": the refresh couldn't be completed (offline, timeout,
//   5xx, rate limited) -- the session may still be fine, so keep it and
//   let a later request try again instead of logging the user out
export type RefreshResult = "refreshed" | "rejected" | "unavailable";

// Exchange the stored refresh token for a new access + refresh pair
// (rotating it in the process). Used by both the axios interceptor below,
// session restore in AuthContext and the socket's connect_error handler.
export const attemptTokenRefresh = (): Promise<RefreshResult> => {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async (): Promise<RefreshResult> => {
    try {
      const storedRefreshToken = await SecureStore.getItemAsync(REFRESH_KEY);
      if (!storedRefreshToken) return "rejected";

      // Bare axios call (not axiosClient) so this request never passes
      // through the response interceptor below and can't recursively
      // trigger another refresh attempt.
      // Same timeout as axiosClient: this runs during launch, so a stalled
      // network must not leave the app waiting on it indefinitely
      const response = await axios.post(
        `${API_URL}/auth/refresh`,
        { refreshToken: storedRefreshToken },
        { timeout: 10000 }
      );

      const { token, refreshToken } = response.data;
      await SecureStore.setItemAsync(JWT_KEY, token);
      await SecureStore.setItemAsync(REFRESH_KEY, refreshToken);
      axiosClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      if (authStateUpdater) {
        authStateUpdater((prev: any) => ({
          ...prev,
          token,
          refreshToken,
        }));
      }

      return "refreshed";
    } catch (error: any) {
      console.error("Token refresh failed:", error);
      const status = error?.response?.status;
      // /auth/refresh answers 401 for an invalid/expired/revoked token and
      // 400 for a missing one; anything else says nothing about the session
      return status === 401 || status === 400 ? "rejected" : "unavailable";
    }
  })().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
};

// Request interceptor - attach the current auth header
axiosClient.interceptors.request.use(
  async (config) => {
    if (isLoggingOut) {
      return Promise.reject(
        new Error("Request cancelled - logout in progress")
      );
    }

    try {
      const token = await SecureStore.getItemAsync(JWT_KEY);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("Error retrieving token from SecureStore: ", error);
    }
    const socketId = getCurrentSocketId();
    if (socketId) {
      config.headers[SOCKET_ID_HEADER] = socketId;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - silently refresh-and-retry on 401, log out only if
// refresh itself fails
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const config = error.config;
    const isAuthFlowRequest = AUTH_FLOW_PATHS.some((path) =>
      config?.url?.includes(path)
    );

    if (status === 401 && config && !config._retry && !isAuthFlowRequest && !isLoggingOut) {
      config._retry = true;
      const result = await attemptTokenRefresh();
      if (result === "refreshed") {
        const token = await SecureStore.getItemAsync(JWT_KEY);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return axiosClient.request(config);
      }

      if (result === "rejected") {
        console.log("401 Unauthorized and refresh rejected - initiating logout");
        await handleLogout();
      }
      // "unavailable": keep the session; this request fails, the next one
      // (e.g. once back online) gets another refresh attempt
    }

    // Tag network/timeout errors for better handling in hooks
    if (!error.response) {
      if (error.code === "ECONNABORTED") {
        error.networkError = "TIMEOUT";
      } else if (
        error.message === "Network Error" ||
        error.code === "ENOTFOUND" ||
        error.code === "ECONNREFUSED"
      ) {
        error.networkError = "NO_INTERNET";
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
