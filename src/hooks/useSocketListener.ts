import { useEffect } from "react";
import { useSocket } from "../context/SocketContext";
import socketService from "../services/socketService";

const useSocketListener = <T = any>(
  eventName: string,
  onEvent: (payload: T) => void
) => {
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;
    const unsubscribe = socketService.addListener(eventName, onEvent);
    return () => {
      unsubscribe();
    };
  }, [socket, eventName, onEvent]);
};

export default useSocketListener;
