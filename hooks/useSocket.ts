import { useRef, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { API_URL } from "../constants/api";
import { useAuth } from "../context/AuthContext";
import * as SecureStore from "expo-secure-store";

const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const { authState } = useAuth();

  const connectSocket = () => {
    if (authState?.authenticated && !socketRef.current) {
      const newSocket = io(API_URL, {
        query: {
          userId: authState.user?._id, // Pass UserId to server
        },
      });
      socketRef.current = newSocket;
      console.log("Socket connected to server");
    } else {
      console.log("Socket already connected or user not authenticated");
    }
  };

  const disconnectSocket = () => {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
      console.log("Socket disconnected from server");
    } else {
      console.log("No socket to disconnect");
    }
  };

  useEffect(() => {
    if (authState?.authenticated) {
      connectSocket();
    } else {
      disconnectSocket();
    }

    return () => {
      disconnectSocket();
    };
  }, [authState?.authenticated]);

  return { socket: socketRef.current, connectSocket, disconnectSocket };
};

export default useSocket;
