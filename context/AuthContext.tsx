import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { checkTokenExpiry } from "@/utils/checkTokenExpiry";
import axiosClient from "@/utils/axiosClient";

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
const USER_KEY = "user";

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

  const router = useRouter();

  //////////////////////////////////////////
  // Logout callback function
  const logout = useCallback(async () => {
    // Delete token and user data from secure store
    await SecureStore.deleteItemAsync(JWT_KEY);
    await SecureStore.deleteItemAsync(USER_KEY);

    // Reset HTTP headers
    // axios.defaults.headers.common["Authorization"] = "";
    axiosClient.defaults.headers.common["Authorization"] = "";

    // Reset authState
    setAuthState({
      token: null,
      authenticated: false,
      user: null,
    });
    router.replace("/guests/Login");
  }, []);

  //////////////////////////////////////////
  // Function to restore auth state from SecureStore
  const restoreAuthState = async () => {
    console.log("Restoring JWT/USER from SecureStore");
    const token = await SecureStore.getItemAsync(JWT_KEY);
    const user = await SecureStore.getItemAsync(USER_KEY);

    if (token) {
      // Check token expiry
      const isTokenValid = checkTokenExpiry(token);
      if (!isTokenValid) {
        logout();
        return;
      }

      // Update state with token and user data
      setAuthState({
        token: token,
        authenticated: true,
        user: user ? JSON.parse(user) : null,
      });
    }
  };

  // Check token on load
  useEffect(() => {
    restoreAuthState();
  }, []);

  // Register
  const signup = async (
    username: string,
    password: string,
    uniqueId: string
  ) => {
    try {
      return await axiosClient.post("/api/auth/signup", {
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
      const result = await axiosClient.post("/api/auth/login", {
        username,
        password,
      });

      // Extract token and user data from the result
      const { token, _id, uniqueId, nickname, profilePhoto } = result.data;

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

      // Add JWT token to HTTP headers
      axiosClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      await SecureStore.setItemAsync(JWT_KEY, token);
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(result.data));

      return result;
    } catch (e) {
      throw new Error(e.response.data.error);
    }
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
