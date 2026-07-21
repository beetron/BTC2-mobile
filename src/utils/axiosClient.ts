import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { API_URL } from "@/src/constants/api";

export const JWT_KEY = "jwt";
export const REFRESH_KEY = "refreshToken";
export const USER_KEY = "user";
let isLoggingOut = false;

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
    const refreshToken = await SecureStore.getItemAsync(REFRESH_KEY);

    // Clear headers and storage
    delete axiosClient.defaults.headers.common["Authorization"];

    await Promise.all([
      SecureStore.deleteItemAsync(JWT_KEY),
      SecureStore.deleteItemAsync(REFRESH_KEY),
      SecureStore.deleteItemAsync(USER_KEY),
    ]);

    console.log("Logged out - tokens cleared");

    // Best-effort server-side revocation; failure is fine since local state
    // is already cleared.
    if (refreshToken) {
      axiosClient
        .post("/auth/logout", { refreshToken })
        .catch(() => {});
    }

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
let refreshPromise: Promise<boolean> | null = null;

// Exchange the stored refresh token for a new access + refresh pair
// (rotating it in the process). Returns true if a valid access token is
// available afterward. Used by both the axios interceptor below and the
// socket's connect_error handler.
export const attemptTokenRefresh = (): Promise<boolean> => {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const storedRefreshToken = await SecureStore.getItemAsync(REFRESH_KEY);
      if (!storedRefreshToken) return false;

      // Bare axios call (not axiosClient) so this request never passes
      // through the response interceptor below and can't recursively
      // trigger another refresh attempt.
      const response = await axios.post(`${API_URL}/auth/refresh`, {
        refreshToken: storedRefreshToken,
      });

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

      return true;
    } catch (error) {
      console.error("Token refresh failed:", error);
      return false;
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
      const refreshed = await attemptTokenRefresh();
      if (refreshed) {
        const token = await SecureStore.getItemAsync(JWT_KEY);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return axiosClient.request(config);
      }

      console.log("401 Unauthorized and refresh failed - initiating logout");
      await handleLogout();
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
