import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { API_URL } from "@/src/constants/api";
import { checkTokenExpiry } from "@/src/utils/checkTokenExpiry";
import { router } from "expo-router";
import { Alert } from "react-native";

const JWT_KEY = "jwt";
const USER_KEY = "user";
console.log("API_URL: ", API_URL);

const axiosClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

axiosClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync(JWT_KEY);
      if (token) {
        const isTokenValid = checkTokenExpiry(token);
        if (!isTokenValid) {
          // Delete token and user data from secure store
          await SecureStore.deleteItemAsync(JWT_KEY);
          await SecureStore.deleteItemAsync(USER_KEY);
          console.log(
            "Token expired during request - removing from SecureStore"
          );
          router.replace("/guests/Login");
          return config;
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

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle connection errors
    if (!error.response) {
      Alert.alert(
        "Connection Error",
        "Failed to connect to server. Please check your internet connection.",
        [{ text: "OK" }],
        { cancelable: false }
      );
      return Promise.reject(new Error("Network Error"));
    }

    // Handle 401 unauthorized errors
    if (error.response.status === 401) {
      await SecureStore.deleteItemAsync(JWT_KEY);
      await SecureStore.deleteItemAsync(USER_KEY);
      console.log("Authentication error - tokens cleared");
      router.replace("/guests/Login");
    }

    return Promise.reject(error);
  }
);

// axiosClient.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     // Handle 401 unauthorized errors
//     if (error.response && error.response.status === 401) {
//       // Delete token and user data from secure store
//       await SecureStore.deleteItemAsync(JWT_KEY);
//       await SecureStore.deleteItemAsync(USER_KEY);
//       console.log("Authentication error - tokens cleared");
//       router.replace("/guests/Login");
//     }
//     return Promise.reject(error);
//   }
// );

export default axiosClient;
