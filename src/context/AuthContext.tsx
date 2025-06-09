import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { checkTokenExpiry } from "@/src/utils/checkTokenExpiry";
import axiosClient, {
  handleLogout,
  JWT_KEY,
  USER_KEY,
  setAuthStateUpdater,
} from "@/src/utils/axiosClient";

interface AuthProps {
  authState?: {
    token: string | null;
    authenticated: boolean | null;
    user?: {
      _id: string;
      uniqueId: string;
      nickname: string;
      profileImage: string;
    } | null;
  };
  setAuthState?: React.Dispatch<
    React.SetStateAction<{
      token: string | null;
      authenticated: boolean | null;
      user?: {
        _id: string;
        uniqueId: string;
        nickname: string;
        profileImage: string;
      } | null;
    }>
  >;
  onSignup?: (
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
  const [authState, setAuthState] = useState<{
    token: string | null;
    authenticated: boolean | null;
    user?: {
      _id: string;
      uniqueId: string;
      nickname: string;
      profileImage: string;
    } | null;
  }>({
    token: null,
    authenticated: false,
    user: null,
  });

  const router = useRouter();

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
          authenticated: false,
          user: null,
        }));
        return;
      } else {
        const isTokenValid = checkTokenExpiry(token);
        if (!isTokenValid) {
          console.log("Token expired during restore - logging out");
          await logout();
          return;
        }

        const parsedUser = userData ? JSON.parse(userData) : null;
        setAuthState({
          token: token,
          authenticated: true,
          user: parsedUser
            ? {
                _id: parsedUser._id,
                uniqueId: parsedUser.uniqueId,
                nickname: parsedUser.nickname,
                profileImage: parsedUser.profileImage,
              }
            : null,
        });

        axiosClient.defaults.headers.common["Authorization"] =
          `Bearer ${token}`;
      }
    } catch (error) {
      console.error("Error in restoreAuthState:", error);
      setAuthState({
        token: null,
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
    username: string,
    password: string,
    uniqueId: string
  ) => {
    try {
      const result = await axiosClient.post("/auth/signup", {
        username,
        password,
        uniqueId,
      });
      return result;
    } catch (e) {
      throw new Error(e.response.data.error);
    }
  };

  // Login
  const login = async (username: string, password: string) => {
    try {
      const result = await axiosClient.post("/auth/login", {
        username,
        password,
      });

      // Extract token and user data from the result
      const { token, _id, uniqueId, nickname, profileImage } = result.data;

      console.log("Login result: ", result.data);

      setAuthState({
        token: token,
        authenticated: true,
        user: {
          _id: _id,
          uniqueId: uniqueId,
          nickname: nickname,
          profileImage: profileImage,
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
    setAuthState,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
