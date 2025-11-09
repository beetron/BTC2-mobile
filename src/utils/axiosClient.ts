import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { API_URL } from "@/src/constants/api";
import { checkTokenExpiry } from "./checkTokenExpiry";

export const JWT_KEY = "jwt";
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
    // Clear headers and storage
    delete axiosClient.defaults.headers.common["Authorization"];

    await Promise.all([
      SecureStore.deleteItemAsync(JWT_KEY),
      SecureStore.deleteItemAsync(USER_KEY),
    ]);

    console.log("Logged out - tokens cleared");

    // Immediately update auth state if updater is available
    if (authStateUpdater) {
      authStateUpdater({
        token: null,
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

// Request interceptor - check token expiry before making calls
axiosClient.interceptors.request.use(
  async (config) => {
    if (isLoggingOut) {
      return Promise.reject(
        new Error("Request cancelled - logout in progress")
      );
    }

    try {
      const token = await SecureStore.getItemAsync(JWT_KEY);
      console.log("Token found:", !!token);

      if (token) {
        console.log("Checking token expiry...");
        const isTokenValid = checkTokenExpiry(token);
        console.log("Token is valid:", isTokenValid);

        if (!isTokenValid) {
          console.log("Token expired during request - initiating logout");

          // Clear tokens immediately
          await SecureStore.deleteItemAsync(JWT_KEY);
          await SecureStore.deleteItemAsync(USER_KEY);
          delete axiosClient.defaults.headers.common["Authorization"];

          await handleLogout();
          return Promise.reject(new Error("Token expired"));
        }
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

// Response interceptor - handle 401 errors and network errors
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (
      error.response?.status === 401 &&
      !isLoggingOut &&
      !error.config._retry
    ) {
      error.config._retry = true;
      console.log("401 Unauthorized - initiating logout");
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
