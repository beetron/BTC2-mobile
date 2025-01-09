import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import * as SecureStore from "expo-secure-store";

interface AuthProps {
  authState?: { token: string | null; authenticated: boolean | null };
  onRegister?: (
    username: string,
    password: string,
    uniqueId: string
  ) => Promise<any>;
  onLogin?: (username: string, password: string) => Promise<any>;
  onLogout?: () => Promise<any>;
}

const JWT_KEY = "jwt";
export const API_URL =
  process.env.EXPO_PUBLIC_ENV === "development"
    ? process.env.EXPO_PUBLIC_API_DEV_URL
    : process.env.EXPO_PUBLIC_API_URL;
const AuthContext = createContext<AuthProps>({});

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }: any) => {
  const [authState, setAuthState] = useState<{
    token: string | null;
    authenticated: boolean | null;
  }>({
    token: null,
    authenticated: null,
  });

  // Check token on load
  useEffect(() => {
    const checkToken = async () => {
      console.log("checkToken was called");
      const token = await SecureStore.getItemAsync(JWT_KEY);

      if (token) {
        // Set token in HTTP headers
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        // Update state with token and boolean
        setAuthState({
          token: token,
          authenticated: true,
        });
      }
    };
    checkToken();
  }, []);

  // Register
  const register = async (
    username: string,
    password: string,
    uniqueId: string
  ) => {
    try {
      return await axios.post(`${API_URL}/signup`, {
        username,
        password,
        uniqueId,
      });
    } catch (e) {
      return { error: true, message: (e as any).response.data.message };
    }
  };

  // Login
  const login = async (username: string, password: string) => {
    try {
      const result = await axios.post(`${API_URL}/login`, {
        username,
        password,
      });

      // Set authState
      setAuthState({
        token: result.data.token,
        authenticated: true,
      });

      // Set token to every axios request
      axios.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${result.data.token}`;

      // Store token in secure store
      await SecureStore.setItemAsync(JWT_KEY, result.data.token);
      return result;
    } catch (e) {
      return { error: true, message: (e as any).response.data.message };
    }
  };

  // Logout
  const logout = async () => {
    try {
      // Delete token from secure store
      await SecureStore.deleteItemAsync(JWT_KEY);

      // Reset HTTP headers
      axios.defaults.headers.common["Authorization"] = "";

      // Reset authState
      setAuthState({
        token: null,
        authenticated: false,
      });
    } catch (e) {
      return { error: true, message: (e as any).response.data.message };
    }
  };

  const value = {
    onRegister: register,
    onLogin: login,
    onLogout: logout,
    authState,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
