import React, { createContext, useContext, useEffect, useRef } from "react";
import { AppState, AppStateStatus } from "react-native";
import useSocket from "../hooks/useSocket";

const AppStateContext = createContext<{
  addListener: (callback: () => void) => void;
} | null>(null);

export const AppStateProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const listeners = useRef<Set<() => void>>(new Set());

  // Manage socket connection via useSocket hook within AppStateProvider
  const { connectSocket, disconnectSocket } = useSocket();

  useEffect(() => {
    console.log("AppState: " + AppState.currentState);

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === "active") {
        console.log("AppState Acitve");
        listeners.current.forEach((callback) => callback());

        // Reconnect socket if it exists
        connectSocket();
        console.log("connectSocket called in AppStateContext");
      }
      if (nextAppState === "background") {
        console.log("AppState Background");

        // Disconnect socket if it exists
        disconnectSocket();
      }
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    return () => {
      subscription.remove();
      console.log("AppState listener removed");
    };
  }, []);

  const addListener = (callback: () => void) => {
    listeners.current.add(callback);
    return () => {
      listeners.current.delete(callback);
    };
  };

  return (
    <AppStateContext.Provider value={{ addListener }}>
      {children}
    </AppStateContext.Provider>
  );
};

export const useAppStateListener = (callback: () => void) => {
  const context = useContext(AppStateContext);
  useEffect(() => {
    if (context) {
      const removeListener = context.addListener(callback);
      return removeListener;
    }
  }, [context, callback]);
};

export default AppStateContext;
