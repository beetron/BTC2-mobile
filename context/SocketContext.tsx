import React, {
  createContext,
  useContext,
  useEffect,
  useCallback,
  useState,
  ReactNode,
  FC,
} from "react";
import { io, Socket } from "socket.io-client";
import { API_URL } from "../constants/api";
import { useAuth } from "./AuthContext";
import { useAppStateListener } from "./AppStateContext";

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
  const [isConnected, setIsConnected] = useState(false);

  const initializeSocket = useCallback(() => {
    if (authState?.authenticated && !socket) {
      const newSocket = io(API_URL, {
        transports: ["websocket"],
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        query: {
          userId: authState.user?._id,
        },
      });

      newSocket.on("connect", () => {
        console.log("Socket connected with ID:", newSocket.id);
        setIsConnected(true);
      });

      newSocket.on("disconnect", () => {
        console.log("Socket disconnected");
        setIsConnected(false);
      });

      setSocket(newSocket);
    }
  }, [authState?.authenticated, socket]);

  const reconnect = useCallback(() => {
    if (socket) {
      socket.connect();
    } else {
      initializeSocket();
    }
  }, [socket, initializeSocket]);

  // Initial socket connection
  useEffect(() => {
    initializeSocket();
    return () => {
      socket?.disconnect();
    };
  }, [authState?.authenticated]);

  // Use AppStateListener instead of directly using AppState
  useAppStateListener(() => {
    console.log("App became active, socket ID:", socket?.id ?? "no socket");
    reconnect();
  });

  return (
    <SocketContext.Provider value={{ socket, isConnected, reconnect }}>
      {children}
    </SocketContext.Provider>
  );
};

// Export hook
export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};
