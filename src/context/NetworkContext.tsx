import React, { createContext, useContext, useEffect, useState } from "react";
import * as Network from "expo-network";

interface NetworkContextType {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  type: string | null;
  isLoading: boolean;
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

export const NetworkProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [isInternetReachable, setIsInternetReachable] = useState<
    boolean | null
  >(null);
  const [type, setType] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    const initializeNetwork = async () => {
      try {
        // Check initial network state
        const state = await Network.getNetworkStateAsync();
        setIsConnected(state.isConnected ?? true);
        setIsInternetReachable(state.isInternetReachable ?? null);
        setType(state.type ?? null);
      } catch (error) {
        console.warn(
          "Network module not available - using fallback. Rebuild with EAS or expo run:ios",
          error
        );
        setIsConnected(true); // Default to online if module not available
      } finally {
        setIsLoading(false);
      }
    };

    initializeNetwork();

    // Subscribe to network state changes
    try {
      const subscription = Network.addNetworkStateListener((state) => {
        setIsConnected(state.isConnected ?? true);
        setIsInternetReachable(state.isInternetReachable ?? null);
        setType(state.type ?? null);
      });

      unsubscribe = subscription.remove;
    } catch (error) {
      console.warn("Network listener not available - skipping", error);
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  return (
    <NetworkContext.Provider
      value={{ isConnected, isInternetReachable, type, isLoading }}
    >
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetwork = () => {
  const context = useContext(NetworkContext);
  if (context === undefined) {
    throw new Error("useNetwork must be used within a NetworkProvider");
  }
  return context;
};
