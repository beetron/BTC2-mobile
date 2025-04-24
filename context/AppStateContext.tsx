import React, { createContext, useContext, useEffect, useRef } from "react";
import { AppState, AppStateStatus } from "react-native";
import useResetBadgeCount from "@/hooks/useResetBadgeCount";

const AppStateContext = createContext<{
  addListener: (callback: () => void) => void;
} | null>(null);

export const AppStateProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const listeners = useRef<Set<() => void>>(new Set());

  // Reset badge count import
  const { resetBadgeCount } = useResetBadgeCount();

  useEffect(() => {
    console.log("AppState: " + AppState.currentState);

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      // When AppState is active
      if (nextAppState === "active") {
        console.log("AppState Active");
        // Reset badge count
        resetBadgeCount();
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
