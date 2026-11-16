import {
  Alert,
  View,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
} from "react-native";
import React, { useCallback, useEffect } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import ConversationMessages from "../../components/ConversationMessages";
import ConversationHeader from "../../components/ConversationHeader";
import ConversationInput from "../../components/ConversationInput";
import conversationStore, { isConversationOpen } from "../../zustand/conversationStore";
import useGetConversationDetail from "../../hooks/useGetConversationDetail";
import useSocketListener from "../../hooks/useSocketListener";
import { useThemeColors } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "../../hooks/useTranslation";
import axiosClient from "../../utils/axiosClient";

// One move to a new direct conversation at a time: the clearer gets both
// the HTTP response and the socket event for the same deletion
let reopeningFrom: string | null = null;

const Conversation = () => {
  const { conversationId } = useLocalSearchParams<{
    conversationId: string;
  }>();
  const router = useRouter();
  const { selectedConversation } = conversationStore();
  const { getConversationDetail } = useGetConversationDetail();
  const colors = useThemeColors();
  const { authState } = useAuth();
  const { t } = useTranslation();
  const myUserId = authState?.user?._id;

  // Always resolve full detail from the conversationId route param, rather
  // than relying on whatever navigated here to have already seeded the
  // store -- one uniform code path regardless of origin (list tap, new-chat
  // tap, or a future notification deep link).
  useEffect(() => {
    if (!conversationId) {
      router.dismissTo("/members");
      return;
    }
    let active = true;
    if (selectedConversation?.conversationId !== conversationId) {
      // `active`: a response for a chat already left must neither replace
      // the one now open nor navigate away from it
      getConversationDetail(conversationId, () => active).then((success) => {
        if (active && !success) router.dismissTo("/members");
      });
    }
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  // Reload names, members and roles when the group changes while open,
  // so new members' messages get their name and avatar, a rename shows,
  // and a member promoted to owner gets the owner controls
  const refreshDetail = useCallback(
    (payload: { conversationId?: string }) => {
      if (!conversationId || payload?.conversationId !== conversationId) return;
      getConversationDetail(conversationId, () => isConversationOpen(conversationId));
    },
    [conversationId, getConversationDetail]
  );
  useSocketListener("conversation:memberAdded", refreshDetail);
  useSocketListener("conversation:updated", refreshDetail);

  const onMemberRemoved = useCallback(
    (payload: { conversationId?: string; userId?: string }) => {
      if (!conversationId || payload?.conversationId !== conversationId) return;
      if (payload.userId !== myUserId) {
        refreshDetail(payload);
        return;
      }
      // Leaving on purpose: Group Settings handles the way out
      if (conversationStore.getState().leavingConversationId === conversationId) return;
      Alert.alert(t("group.removedFromGroupTitle"), t("group.removedFromGroupMessage"));
      router.dismissTo("/members");
    },
    [conversationId, myUserId, refreshDetail, router, t]
  );
  useSocketListener("conversation:memberRemoved", onMemberRemoved);

  // Both sides cleared this direct chat, so the server deleted it. Move to
  // a fresh conversation with the same person in place; staying on the old
  // one would make every send fail.
  const onConversationDeleted = useCallback(
    async (payload: { conversationId?: string }) => {
      if (!conversationId || payload?.conversationId !== conversationId) return;
      const partnerId = conversationStore.getState().selectedConversation?.partnerId;
      if (reopeningFrom === conversationId) return;
      reopeningFrom = conversationId;
      try {
        if (!partnerId) throw new Error("No partner");
        const res = await axiosClient.post("/conversations/direct", { userId: partnerId });
        if (isConversationOpen(conversationId)) {
          router.setParams({ conversationId: res.data.conversationId });
        }
      } catch (error: any) {
        console.log("Error reopening conversation:", error.response?.data?.error || error.message);
        if (isConversationOpen(conversationId)) router.dismissTo("/members");
      } finally {
        reopeningFrom = null;
      }
    },
    [conversationId, router]
  );
  useSocketListener("conversation:deleted", onConversationDeleted);
  // Same move when this device cleared it and the socket was down
  useEffect(() => {
    const unsubscribe = conversationStore.subscribe((state, prev) => {
      if (
        state.deletedConversationId &&
        state.deletedConversationId !== prev.deletedConversationId
      ) {
        onConversationDeleted({ conversationId: state.deletedConversationId });
      }
    });
    return unsubscribe;
  }, [onConversationDeleted]);

  if (!selectedConversation || selectedConversation.conversationId !== conversationId) {
    return (
      <View className="flex-1 bg-bg justify-center items-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-bg">
      <ConversationHeader />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ConversationMessages />
        <ConversationInput />
      </KeyboardAvoidingView>
    </View>
  );
};

export default Conversation;
