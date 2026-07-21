import { useState, useCallback } from "react";
import axiosClient from "../utils/axiosClient";
import { useFocusEffect } from "expo-router";
import { Alert } from "react-native";
import { useNetwork } from "@/src/context/NetworkContext";

export interface GroupConversationSummary {
  conversationId: string;
  name: string | null;
  memberCount: number;
  lastMessageAt: string | null;
  unreadCount: number;
}

// Mirrors useGetMyFriends.ts's shape -- GET /conversations returns both
// direct and group rows, we only want the group ones here since direct
// rows are already covered by the friend list.
const useGetGroupConversations = () => {
  const [groupConversations, setGroupConversations] = useState<
    GroupConversationSummary[]
  >([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { isConnected } = useNetwork();

  const getGroupConversations = useCallback(async () => {
    try {
      setIsLoading(true);

      if (!isConnected) {
        Alert.alert(
          "No Internet Connection",
          "Please check your connection to load groups"
        );
        setIsLoading(false);
        return;
      }

      const res = await axiosClient.get("/conversations");
      const groups = (res.data || []).filter(
        (c: any) => c.type === "group"
      );
      setGroupConversations(groups);
    } catch (error: any) {
      if (error.networkError === "TIMEOUT") {
        Alert.alert(
          "Connection Timeout",
          "Request took too long. Please try again"
        );
      } else if (error.networkError === "NO_INTERNET") {
        Alert.alert(
          "No Internet Connection",
          "Please check your connection and try again"
        );
      } else if (error.message !== "Unauthorized") {
        console.log("Error: ", error.response?.data?.error || error.message);
      }
    } finally {
      setIsLoading(false);
    }
  }, [isConnected]);

  useFocusEffect(
    useCallback(() => {
      getGroupConversations();
    }, [getGroupConversations])
  );

  return { groupConversations, isLoading, getGroupConversations };
};

export default useGetGroupConversations;
