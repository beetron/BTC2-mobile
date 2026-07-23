import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useRouter } from "expo-router";
import { Alert } from "react-native";
import * as SecureStore from "expo-secure-store";
import { checkTokenExpiry } from "@/src/utils/checkTokenExpiry";
import axiosClient, {
  attemptTokenRefresh,
  handleLogout,
  JWT_KEY,
  REFRESH_KEY,
  USER_KEY,
  setAuthStateUpdater,
} from "@/src/utils/axiosClient";
import { useNetwork } from "@/src/context/NetworkContext";
import { useTranslation } from "@/src/hooks/useTranslation";

interface AuthUser {
  _id: string;
  username: string;
  email: string;
  uniqueId: string;
  nickname: string;
  profileImage: string;
}

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  authenticated: boolean | null;
  user?: AuthUser | null;
}

interface AuthProps {
  authState?: AuthState;
  setAuthState?: React.Dispatch<React.SetStateAction<AuthState>>;
  onSignup?: (
    email: string,
    username: string,
    password: string,
    uniqueId: string
  ) => Promise<any>;
  onLogin?: (username: string, password: string) => Promise<any>;
  onLogout?: () => Promise<any>;
}

const AuthContext = createContext<AuthProps>({});

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }: any) => {
  const [authState, setAuthState] = useState<AuthState>({
    token: null,
    refreshToken: null,
    authenticated: false,
    user: null,
  });

  const router = useRouter();
  const { isConnected } = useNetwork();
  const { t } = useTranslation();

  // Register auth state updater with axiosClient
  useEffect(() => {
    setAuthStateUpdater(setAuthState);

    return () => {
      setAuthStateUpdater(() => {});
    };
  }, []);

  //////////////////////////////////////////
  // Logout callback function via axiosClient utility
  const logout = useCallback(async () => {
    await handleLogout();
    setAuthState({
      token: null,
      refreshToken: null,
      authenticated: false,
      user: null,
    });
  }, []);

  //////////////////////////////////////////
  // Function to restore auth state from SecureStore
  const restoreAuthState = async () => {
    console.log("Restoring JWT/USER from SecureStore");
    try {
      const token = await SecureStore.getItemAsync(JWT_KEY);
      const userData = await SecureStore.getItemAsync(USER_KEY);

      if (!token) {
        setAuthState((prev) => ({
          ...prev,
          token: null,
          refreshToken: null,
          authenticated: false,
          user: null,
        }));
        return;
      }

      let activeToken = token;
      const isTokenValid = checkTokenExpiry(token);
      if (!isTokenValid) {
        // The access token is stale, but a refresh token may still be
        // within its 14-day window -- try a silent refresh before giving
        // up on the session (an existing install with no refresh token
        // yet simply falls through to a normal login).
        console.log(
          "Access token expired during restore - attempting silent refresh"
        );
        const refreshed = await attemptTokenRefresh();
        if (!refreshed) {
          console.log("Silent refresh failed - logging out");
          await logout();
          return;
        }
        const freshToken = await SecureStore.getItemAsync(JWT_KEY);
        if (!freshToken) {
          await logout();
          return;
        }
        activeToken = freshToken;
      }

      const currentRefreshToken = await SecureStore.getItemAsync(REFRESH_KEY);
      const parsedUser = userData ? JSON.parse(userData) : null;
      setAuthState({
        token: activeToken,
        refreshToken: currentRefreshToken,
        authenticated: true,
        user: parsedUser
          ? {
              _id: parsedUser._id,
              username: parsedUser.username,
              email: parsedUser.email,
              uniqueId: parsedUser.uniqueId,
              nickname: parsedUser.nickname,
              profileImage: parsedUser.profileImage,
            }
          : null,
      });

      axiosClient.defaults.headers.common["Authorization"] =
        `Bearer ${activeToken}`;
    } catch (error) {
      console.error("Error in restoreAuthState:", error);
      setAuthState({
        token: null,
        refreshToken: null,
        authenticated: false,
        user: null,
      });
    }
  };

  // Check token on load
  useEffect(() => {
    restoreAuthState();
  }, []);

  // Signup
  const signup = async (
    email: string,
    username: string,
    password: string,
    uniqueId: string
  ) => {
    try {
      if (!isConnected) {
        Alert.alert(t("errors.noInternetTitle"), t("errors.noInternetGeneric"));
        throw new Error("No internet connection");
      }

      const result = await axiosClient.post("/auth/signup", {
        email,
        username,
        password,
        uniqueId,
      });
      return result;
    } catch (e: any) {
      if (e.networkError === "TIMEOUT") {
        Alert.alert(
          t("errors.connectionTimeoutTitle"),
          t("errors.connectionTimeoutMessage")
        );
        throw new Error("Request timeout");
      } else if (e.networkError === "NO_INTERNET") {
        throw new Error("No internet connection");
      } else {
        throw new Error(e.response?.data?.error || e.message);
      }
    }
  };

  // Login
  const login = async (username: string, password: string) => {
    try {
      if (!isConnected) {
        Alert.alert(t("errors.noInternetTitle"), t("errors.noInternetGeneric"));
        throw new Error("No internet connection");
      }

      const result = await axiosClient.post("/auth/login", {
        username,
        password,
      });

      // Extract token and user data from the result
      const {
        token,
        refreshToken,
        _id,
        email,
        uniqueId,
        nickname,
        profileImage,
        username: userUsername,
      } = result.data;

      console.log("Login result: ", result.data);

      setAuthState({
        token: token,
        refreshToken: refreshToken,
        authenticated: true,
        user: {
          _id: _id,
          username: userUsername,
          email: email,
          uniqueId: uniqueId,
          nickname: nickname,
          profileImage: profileImage,
        },
      });

      // Add JWT token to HTTP headers
      axiosClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      await SecureStore.setItemAsync(JWT_KEY, token);
      await SecureStore.setItemAsync(REFRESH_KEY, refreshToken);
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(result.data));

      return result;
    } catch (e: any) {
      if (e.networkError === "TIMEOUT") {
        Alert.alert(
          t("errors.connectionTimeoutTitle"),
          t("errors.connectionTimeoutMessage")
        );
        throw new Error("Request timeout");
      } else if (e.networkError === "NO_INTERNET") {
        throw new Error("No internet connection");
      } else {
        throw new Error(e.response?.data?.error || e.message);
      }
    }
  };

  const value = {
    onSignup: signup,
    onLogin: login,
    onLogout: logout,
    authState,
    setAuthState,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
