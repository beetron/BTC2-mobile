import React, { createContext, useContext, useEffect, useRef } from "react";
import { AppState, AppStateStatus } from "react-native";

const AppStateContext = createContext<{
  addListener: (callback: () => void) => void;
  addBackgroundListener: (callback: () => void) => void;
} | null>(null);

export const AppStateProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const listeners = useRef<Set<() => void>>(new Set());
  const backgroundListeners = useRef<Set<() => void>>(new Set());

  useEffect(() => {
    console.log("AppState: " + AppState.currentState);

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      // When AppState is active
      if (nextAppState === "active") {
        console.log("AppState Active");

        listeners.current.forEach((callback) => callback());
      } else if (nextAppState === "background") {
        console.log("AppState Background");

        backgroundListeners.current.forEach((callback) => callback());
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

  const addBackgroundListener = (callback: () => void) => {
    backgroundListeners.current.add(callback);
    return () => {
      backgroundListeners.current.delete(callback);
    };
  };

  return (
    <AppStateContext.Provider value={{ addListener, addBackgroundListener }}>
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

export const useBackgroundStateListener = (callback: () => void) => {
  const context = useContext(AppStateContext);
  useEffect(() => {
    if (context) {
      const removeListener = context.addBackgroundListener(callback);
      return removeListener;
    }
  }, [context, callback]);
};

export default AppStateContext;
