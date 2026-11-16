import { useEffect, useRef, useState } from "react";
import { AppState, Platform } from "react-native";
import * as Notifications from "expo-notifications";
import axiosClient from "../utils/axiosClient";
import conversationStore, { isConversationOpen } from "../zustand/conversationStore";
import { useHasFeature } from "../zustand/configStore";
import unreadStore from "../zustand/unreadStore";

// A burst of incoming messages becomes one request
const MARK_READ_DELAY_MS = 500;

type Pending = { conversationId: string; messageId: string };

// Loading the newest page marks a chat read on the server, but messages
// that arrive while it is open come in through the changes feed, which
// doesn't. Without this they stay counted as unread and the chat list
// shows "1 new message" for something already seen.
//
// Marks the newest message from someone else once it is on screen and the
// app is in the foreground, a short moment after the last one arrived.
// Leaving the chat sends a pending mark right away instead of dropping it.
const useMarkConversationRead = ({
  myUserId,
  enabled,
}: {
  myUserId: string | undefined;
  // Off while the newest page is still loading: that load marks it read
  enabled: boolean;
}) => {
  const supported = useHasFeature("markRead");
  const conversationId = conversationStore((s) => s.selectedConversation?.conversationId);
  const newest = conversationStore((s) => s.messages[0]);
  const markedReadId = conversationStore((s) => s.markedReadId);
  const [appActive, setAppActive] = useState(AppState.currentState === "active");
  const pending = useRef<Pending | null>(null);

  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) =>
      setAppActive(state === "active")
    );
    return () => sub.remove();
  }, []);

  const newestId = newest?._id;
  const needsMark =
    supported &&
    enabled &&
    !!conversationId &&
    !!newestId &&
    newest.senderId !== myUserId &&
    newestId !== markedReadId;

  useEffect(() => {
    const waiting = pending.current;
    if (!needsMark || !conversationId || !newestId) {
      // Going back to the list clears the open chat from the store, which
      // lands here before this screen unmounts: send what was waiting
      // unless it has been marked meanwhile. An extra mark is harmless,
      // the server never moves the marker backwards.
      if (waiting && waiting.messageId !== markedReadId) flush();
      else pending.current = null;
      return;
    }
    // A different chat opened with a mark still waiting for the last one
    if (waiting && waiting.conversationId !== conversationId) flush();
    pending.current = { conversationId, messageId: newestId };
    if (!appActive) return; // marked once the app is back in front
    const timer = setTimeout(flush, MARK_READ_DELAY_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [needsMark, conversationId, newestId, appActive]);

  // Leaving the chat: send what is waiting now
  useEffect(() => () => flush(), []);

  function flush() {
    const mark = pending.current;
    if (!mark) return;
    pending.current = null;
    sendMark(mark);
  }
};

const sendMark = async ({ conversationId, messageId }: Pending) => {
  try {
    const res = await axiosClient.post(`/conversations/${conversationId}/read`, {
      messageId,
    });
    if (isConversationOpen(conversationId)) {
      conversationStore.getState().setMarkedReadId(messageId);
    }
    if (typeof res.data?.totalUnread === "number" && Platform.OS === "ios") {
      await Notifications.setBadgeCountAsync(res.data.totalUnread);
    }
    unreadStore.getState().bumpReadSignal();
  } catch (error: any) {
    // Not fatal: the next message, or reopening the chat, marks it again
    console.log(
      "Error marking conversation read:",
      error.response?.data?.error || error.message
    );
  }
};

export default useMarkConversationRead;
