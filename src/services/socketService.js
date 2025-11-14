import { io } from "socket.io-client";
import { API_URL } from "../constants/api";

let _socket = null;
let _userId = null;
const _listeners = new Map();

const initialize = (userId) => {
  console.log(
    "🔌 socketService.initialize called with userId:",
    userId,
    "existing socket:",
    !!_socket
  );

  const url = new URL(API_URL);
  const isDevelopment = process.env.EXPO_PUBLIC_ENV === "development";

  // Create socket connection if it doesn't exist
  if (!_socket) {
    console.log("🔌 Creating NEW socket connection");
    _userId = userId;

    _socket = io(url.origin, {
      path: isDevelopment ? "/socket.io" : "/btc-api/socket.io",
      transports: ["websocket"],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      query: { userId },
    });
    console.log(
      `🔌 New socket connecting to ${url.origin} with path ${
        isDevelopment ? "/socket.io" : "/btc-api/socket.io"
      }`
    );
  } else if (!_socket.connected) {
    // Reconnect existing socket if it's disconnected
    console.log("🔌 Reconnecting EXISTING socket");
    _socket.connect();
  } else {
    console.log("🔌 Socket already exists and connected, reusing connection");
  }

  return _socket;
};

// Get current socket instance
const getSocket = () => _socket;

// Check socket connection status
const isConnected = () => Boolean(_socket?.connected);

// Disconnect the socket
const disconnect = () => {
  console.log("🔌 socketService.disconnect called, socket exists:", !!_socket);
  if (_socket) {
    _socket.disconnect();
    _socket = null;
    _userId = null;
  }
};

// Add event listener
const addListener = (event, callback) => {
  if (!_listeners.has(event)) {
    _listeners.set(event, new Set());
  }

  _listeners.get(event)?.add(callback);

  // Return unsubscribe function
  return () => {
    _listeners.get(event)?.delete(callback);
  };
};

const emit = (event, ...args) => {
  _listeners.get(event)?.forEach((callback) => {
    try {
      callback(...args);
    } catch (error) {
      console.error(`Error in socket listener for  ${event}:`, error);
    }
  });
};

// Set up socket event handlers
const setupEvents = () => {
  if (!_socket) return;

  // Clear any existing listeners to avoid duplicates
  _socket.removeAllListeners();

  _socket.on("connect", () => {
    console.log("Socket connected with ID:", _socket?.id);
    emit("connectionChange", true);
  });

  _socket.on("disconnect", () => {
    console.log("Socket disconnected");
    emit("connectionChange", false);
  });

  // In setupEvents function
  _socket.on("newMessageSignal", () => {
    console.log(
      `⭐️ New message signal received at ${new Date().toISOString()}`
    );
    emit("newMessageSignal");
  });
};

// Export the socket service API
const socketService = {
  initialize,
  getSocket,
  isConnected,
  disconnect,
  addListener,
  emit,
  setupEvents,
};

export default socketService;
