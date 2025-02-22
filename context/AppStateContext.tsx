import React, { createContext, useContext, useEffect, useRef } from "react";
import { AppState, AppStateStatus } from "react-native";

const AppStateContext = createContext<{
  addListener: (callback: () => void) => void;
} | null>(null);

export const AppStateProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const listeners = useRef<Set<() => void>>(new Set());

  useEffect(() => {
    console.log("AppState: " + AppState.currentState);

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === "active") {
        console.log("App is active. Calling all listeners...");
        listeners.current.forEach((callback) => callback());
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
      context.addListener(callback);
    }
  }, [context, callback]);
};

export default AppStateContext;
