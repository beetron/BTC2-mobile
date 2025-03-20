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
import { io, Socket } from "socket.io-client";
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

  // Update ref when state changes
  useEffect(() => {
    socketRef.current = socket;
  }, [socket]);

  // Initialize socket or grab existing socket
  const initializeSocket = useCallback(() => {
    if (authState?.authenticated && authState.user?._id) {
      // Get socket from singleton service
      const socket = socketService.initialize(authState.user._id);
      setSocket(socket);

      // Set up socket events
      socketService.setupEvents();

      // Update connection state
      setIsConnected(socket.connected);
    }
  }, [authState?.authenticated]);

  // Reconnect socket
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
      // Only disconnect if authentication state changes
      if (!authState?.authenticated) {
        console.log("User logged out - disconnecting socket");
        socket?.disconnect();
      } else {
        console.log(
          "Component unmounting but user still logged in - keeping socket alive"
        );
      }
    };
  }, [authState?.authenticated]);

  // Listen for connectionChange events from the socket service
  useEffect(() => {
    if (!authState?.authenticated) return;

    const unsubConnection = socketService.addListener(
      "connectionChange",
      (connected: any) => {
        console.log("Socket connection changed:", connected);
        setIsConnected(connected);
      }
    );

    return () => {
      unsubConnection();
    };
  }, [authState?.authenticated]);

  // Listen for newMessageSignal events and update Zustand (setShouldRender)
  useEffect(() => {
    if (!authState?.authenticated) return;

    console.log("Setting up newMessageSignal listener");
    const unsubMessage = socketService.addListener("newMessageSignal", () => {
      console.log("SocketContext: Received newMessageSignal");
      setShouldRender();
    });

    return () => {
      console.log("Cleaning up newMessageSignal listener");
      unsubMessage();
    };
  }, [authState?.authenticated, setShouldRender]);

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
