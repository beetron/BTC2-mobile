import React, {
  createContext,
  useContext,
  useEffect,
  useCallback,
  useState,
  ReactNode,
  FC,
  useRef,
} from "react";
import { Socket } from "socket.io-client";
import { useAuth } from "./AuthContext";
import { useAppStateListener } from "./AppStateContext";
import friendStore from "../zustand/friendStore";
import socketService from "../services/socketService";

interface SocketContextProps {
  socket: Socket | null;
  isConnected: boolean;
  reconnect: () => void;
}

const SocketContext = createContext<SocketContextProps>({
  socket: null,
  isConnected: false,
  reconnect: () => {},
});

export const SocketProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { authState } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const setShouldRender = friendStore((state) => state.setShouldRender);
  const isInitializing = useRef(false);
  const cleanupInProgress = useRef(false);

  // Update ref when state changes
  useEffect(() => {
    socketRef.current = socket;
  }, [socket]);

  // Cleanup function
  const cleanup = useCallback(async () => {
    if (cleanupInProgress.current) return;
    if (!socketRef.current) return;

    try {
      cleanupInProgress.current = true;
      console.log("Cleaning up socket connection");

      socketRef.current.disconnect();
      socketRef.current = null;
      setSocket(null);
      setIsConnected(false);
    } catch (error) {
      console.error("Error during socket cleanup:", error);
    } finally {
      cleanupInProgress.current = false;
    }
  }, []);

  // Initialize socket
  const initializeSocket = useCallback(() => {
    if (
      !authState?.authenticated ||
      !authState.user?._id ||
      isInitializing.current
    ) {
      return;
    }

    try {
      isInitializing.current = true;
      cleanup();

      const newSocket = socketService.initialize(authState.user._id);
      socketService.setupEvents();

      setSocket(newSocket);
      setIsConnected(newSocket.connected);
    } catch (error) {
      console.error("Socket initialization error:", error);
    } finally {
      isInitializing.current = false;
    }
  }, [authState?.authenticated, authState?.user?._id, cleanup]);

  // Reconnect socket with debounce
  const reconnect = useCallback(() => {
    if (!authState?.authenticated) return;

    if (socket) {
      socket.connect();
    } else {
      initializeSocket();
    }
  }, [socket, initializeSocket, authState?.authenticated]);

  // Handle authentication state changes
  useEffect(() => {
    if (authState?.authenticated) {
      initializeSocket();
    } else {
      cleanup();
    }

    return () => {
      cleanup();
    };
  }, [authState?.authenticated, initializeSocket, cleanup]);

  // Listen for connection changes
  useEffect(() => {
    if (!authState?.authenticated) return;

    const unsubConnection = socketService.addListener(
      "connectionChange",
      (connected: boolean) => {
        console.log("Socket connection changed:", connected);
        setIsConnected(connected);
      }
    );

    return () => {
      unsubConnection();
    };
  }, [authState?.authenticated]);

  // Listen for new messages
  useEffect(() => {
    if (!authState?.authenticated) return;

    console.log("Setting up newMessageSignal listener");
    const unsubMessage = socketService.addListener("newMessageSignal", () => {
      if (authState?.authenticated) {
        console.log("SocketContext: Received newMessageSignal");
        setShouldRender();
      }
    });

    return () => {
      console.log("Cleaning up newMessageSignal listener");
      unsubMessage();
    };
  }, [authState?.authenticated, setShouldRender]);

  // Handle app state changes
  useAppStateListener(() => {
    if (authState?.authenticated) {
      console.log("App became active, socket ID:", socket?.id ?? "no socket");
      reconnect();
    }
  });

  const contextValue = {
    socket,
    isConnected,
    reconnect,
  };

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

export default SocketContext;
