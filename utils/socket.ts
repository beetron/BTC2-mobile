import { io } from "socket.io-client";

// Get API URL
export const API_URL =
  process.env.EXPO_PUBLIC_ENV === "development"
    ? process.env.EXPO_PUBLIC_API_DEV_URL
    : process.env.EXPO_PUBLIC_API_URL;

// Socket connection to backend
const socket = () => {
  const socket = io(API_URL);

  if (socket) {
    console.log("Socket connected");
  }
};

export default socket;
