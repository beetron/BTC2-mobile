import { io } from "socket.io-client";
import * as SecureStore from "expo-secure-store";
import { API_URL } from "../constants/api";
import { attemptTokenRefresh, JWT_KEY } from "../utils/axiosClient";
import { setCurrentSocketId } from "../utils/socketIdentity";

let _socket = null;
const _listeners = new Map();

const initialize = (userId, token) => {
  console.log(
    "🔌 socketService.initialize called with userId:",
    userId,
    "existing socket:",
    !!_socket
  );

  const url = new URL(API_URL);
  // Derived from API_URL itself rather than EXPO_PUBLIC_ENV -- a dev build
  // can point at a local server (no path prefix) or the live API behind a
  // reverse proxy (/btc-api prefix) just as easily as a prod build can, so
  // "development" is not a reliable signal for whether a prefix is needed.
  // Whatever prefix API_URL has (or doesn't), the socket path matches it.
  const basePath = url.pathname.replace(/\/$/, "");

  // Create socket connection if it doesn't exist
  if (!_socket) {
    console.log("🔌 Creating NEW socket connection");

    // Identity comes from the JWT in the auth payload -- no legacy userId
    // query param, matching where the backend's SOCKET_REQUIRE_AUTH flag
    // is headed.
    _socket = io(url.origin, {
      path: `${basePath}/socket.io`,
      transports: ["websocket"],
      autoConnect: true,
      reconnection: true,
      // Keep trying while the app is in the foreground (it disconnects on
      // background). With 5 attempts (~20s) a short signal drop, e.g. a
      // train tunnel, left chats without live updates until the app was
      // backgrounded and reopened. Backoff is capped at socket.io's 5s.
      reconnectionAttempts: Infinity,
      auth: { token },
    });
    console.log(
      `🔌 New socket connecting to ${url.origin} with path ${basePath}/socket.io`
    );
  } else if (!_socket.connected) {
    // Reconnect existing socket if it's disconnected
    console.log("🔌 Reconnecting EXISTING socket");
    _socket.auth = { token };
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
  }
  setCurrentSocketId(null);
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
    setCurrentSocketId(_socket?.id);
    emit("connectionChange", true);
  });

  _socket.on("disconnect", () => {
    console.log("Socket disconnected");
    setCurrentSocketId(null);
    emit("connectionChange", false);
  });

  _socket.on("connect_error", async (error) => {
    console.log("Socket connect_error:", error?.message);

    // The server rejects the handshake with "Unauthorized" once
    // SOCKET_REQUIRE_AUTH is enabled and the access token is missing or
    // expired. Try a silent refresh before giving up -- on success, just
    // update the auth payload; socket.io's own reconnection loop picks up
    // the new token on its next automatic attempt.
    if (error?.message === "Unauthorized") {
      console.warn("Socket handshake unauthorized - attempting token refresh");
      const result = await attemptTokenRefresh();
      if (result === "refreshed" && _socket) {
        const freshToken = await SecureStore.getItemAsync(JWT_KEY);
        _socket.auth = { token: freshToken };
        console.log("Token refreshed - socket will retry with new token");
      } else if (result === "rejected") {
        // The session is over: stop the (unlimited) retry loop. The next
        // API call gets the same rejection and logs out.
        console.warn("Token refresh rejected - giving up on socket auth");
        _socket?.disconnect();
        emit("authFailed");
      } else {
        // Offline / server unreachable: the reconnect loop tries again,
        // and refreshes again on its next Unauthorized
        console.warn("Token refresh unavailable - socket will retry");
      }
    }
  });

  // Legacy signal, still emitted alongside conversation:message for clients
  // sending via /messages/*
  _socket.on("newMessageSignal", () => {
    console.log(
      `⭐️ New message signal received at ${new Date().toISOString()}`
    );
    emit("newMessageSignal");
  });

  // Conversation-room broadcasts (direct + group)
  _socket.on("conversation:message", (payload) => {
    emit("conversation:message", payload);
  });
  _socket.on("conversation:updated", (payload) => {
    emit("conversation:updated", payload);
  });
  _socket.on("conversation:memberAdded", (payload) => {
    emit("conversation:memberAdded", payload);
  });
  _socket.on("conversation:memberRemoved", (payload) => {
    emit("conversation:memberRemoved", payload);
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
