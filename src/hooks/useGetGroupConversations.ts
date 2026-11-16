import { useState, useCallback, useRef } from "react";
import axiosClient from "../utils/axiosClient";
import { useFocusEffect } from "expo-router";
import { Alert } from "react-native";
import { alertOnce } from "../utils/alertOnce";
import { useNetwork } from "@/src/context/NetworkContext";
import { useTranslation } from "@/src/hooks/useTranslation";

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
  // True once a fetch has succeeded (see useGetMyFriends)
  const [hasLoaded, setHasLoaded] = useState(false);
  const { isConnected } = useNetwork();
  const { t } = useTranslation();
  // Guards against overlapping requests -- rapidly switching tabs re-fires
  // the focus effect below before a previous /conversations call has
  // resolved, otherwise stacking more of the same request on every switch.
  const isFetchingRef = useRef(false);
  // A call that arrives while one is in flight runs once more afterwards
  // instead of being dropped: the one in flight may have been answered
  // before the change that triggered this call (e.g. the chat being marked
  // read on the way back to the list), leaving a stale unread count.
  const refetchRef = useRef(false);

  const getGroupConversations = useCallback(async () => {
    if (isFetchingRef.current) {
      refetchRef.current = true;
      return;
    }
    isFetchingRef.current = true;
    try {
      setIsLoading(true);

      if (!isConnected) {
        alertOnce("noInternet", t("errors.noInternetTitle"), t("errors.noInternetLoadGroups"));
        setIsLoading(false);
        return;
      }

      const res = await axiosClient.get("/conversations");
      const groups = (res.data || []).filter(
        (c: any) => c.type === "group"
      );
      setGroupConversations(groups);
      setHasLoaded(true);
    } catch (error: any) {
      if (error.networkError === "TIMEOUT") {
        Alert.alert(
          t("errors.connectionTimeoutTitle"),
          t("errors.connectionTimeoutMessage")
        );
      } else if (error.networkError === "NO_INTERNET") {
        Alert.alert(t("errors.noInternetTitle"), t("errors.noInternetGeneric"));
      } else if (error.message !== "Unauthorized") {
        console.log("Error: ", error.response?.data?.error || error.message);
      }
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
      if (refetchRef.current) {
        refetchRef.current = false;
        getGroupConversations();
      }
    }
  }, [isConnected, t]);

  useFocusEffect(
    useCallback(() => {
      getGroupConversations();
    }, [getGroupConversations])
  );

  return { groupConversations, isLoading, hasLoaded, getGroupConversations };
};

export default useGetGroupConversations;
