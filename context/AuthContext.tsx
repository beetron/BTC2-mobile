import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { checkTokenExpiry } from "@/utils/checkTokenExpiry";
import { API_URL } from "@/constants/api";

interface AuthProps {
  authState?: {
    token: string | null;
    authenticated: boolean | null;
    user?: {
      _id: string;
      uniqueId: string;
      nickname: string;
      profilePhoto: string;
    } | null;
  };
  onSignup?: (
    username: string,
    password: string,
    uniqueId: string
  ) => Promise<any>;
  onLogin?: (username: string, password: string) => Promise<any>;
  onLogout?: () => Promise<any>;
}

const JWT_KEY = "jwt";

const AuthContext = createContext<AuthProps>({});

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }: any) => {
  const [authState, setAuthState] = useState<{
    token: string | null;
    authenticated: boolean | null;
    user?: {
      _id: string;
      uniqueId: string;
      nickname: string;
      profilePhoto: string;
    } | null;
  }>({
    token: null,
    authenticated: null,
    user: null,
  });

  // Check token on load
  useEffect(() => {
    const checkToken = async () => {
      const token = await SecureStore.getItemAsync(JWT_KEY);

      if (token) {
        // Check token expiry
        const isTokenValid = checkTokenExpiry(token);
        if (!isTokenValid) {
          logout();
          return;
        }

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
  const signup = async (
    username: string,
    password: string,
    uniqueId: string
  ) => {
    try {
      return await axios.post(`${API_URL}/api/auth/signup`, {
        username,
        password,
        uniqueId,
      });
    } catch (e) {
      throw new Error(e.response.data.error);
    }
  };

  // Login
  const login = async (username: string, password: string) => {
    try {
      const result = await axios.post(`${API_URL}/api/auth/login`, {
        username,
        password,
      });

      // Extract token and user data from the result
      const { token, _id, uniqueId, nickname, profilePhoto } = result.data;

      // Set authState
      // setAuthState({
      //   token: result.data.token,
      //   authenticated: true,
      //   user: {
      //     _id: result.data._id,
      //     uniqueId: result.data.uniqueId,
      //     nickname: result.data.nickname,
      //     profilePhoto: result.data.profilePhoto,
      //   },
      // });
      setAuthState({
        token: token,
        authenticated: true,
        user: {
          _id: _id,
          uniqueId: uniqueId,
          nickname: nickname,
          profilePhoto: profilePhoto,
        },
      });

      // Set token to every axios request
      // axios.defaults.headers.common[
      //   "Authorization"
      // ] = `Bearer ${result.data.token}`;
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // Store token in secure store
      // await SecureStore.setItemAsync(JWT_KEY, result.data.token);
      await SecureStore.setItemAsync(JWT_KEY, token);

      return result;
    } catch (e) {
      throw new Error(e.response.data.error);
    }
  };

  // Logout
  const logout = async () => {
    // Delete token from secure store
    await SecureStore.deleteItemAsync(JWT_KEY);

    // Reset HTTP headers
    axios.defaults.headers.common["Authorization"] = "";

    // Reset authState
    setAuthState({
      token: null,
      authenticated: false,
    });
  };

  const value = {
    onSignup: signup,
    onLogin: login,
    onLogout: logout,
    authState,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
