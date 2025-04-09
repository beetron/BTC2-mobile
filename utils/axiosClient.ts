import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { API_URL } from "@/constants/api";
import { checkTokenExpiry } from "@/utils/checkTokenExpiry";
import { router } from "expo-router";

const JWT_KEY = "jwt";
const USER_KEY = "user";

const axiosClient = axios.create({
    baseURL: API_URL,
    timeout: 10000,
});

axiosClient.interceptors.request.use(async (config) => {
    try {
        const token = await SecureStore.getItemAsync(JWT_KEY);
        if (token) {
            const isTokenValid = checkTokenExpiry(token);
            if (!isTokenValid) {
                // Delete token and user data from secure store
                await SecureStore.deleteItemAsync(JWT_KEY);
                await SecureStore.deleteItemAsync(USER_KEY);
                console.log("Token expired during request - removing from SecureStore");
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
})

axiosClient.interceptors.response.use(
    response => response,
    async (error) => {
        // Handle 401 unauthorized errors
        if (error.response && error.response.status === 401) {
            // Delete token and user data from secure store
            await SecureStore.deleteItemAsync(JWT_KEY);
            await SecureStore.deleteItemAsync(USER_KEY);
            console.log("Authentication error - tokens cleared");
            router.replace("/guests/Login");
        }
        return Promise.reject(error);
    }
);

export default axiosClient;