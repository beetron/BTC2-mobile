import { create } from "zustand";

interface UnreadStore {
  totalUnreadCount: number;
  setTotalUnreadCount: (count: number) => void;
  // Bumped after the open chat is marked read on the server, so the chat
  // list can refetch counts that it may have loaded just before that
  readSignal: number;
  bumpReadSignal: () => void;
}

const unreadStore = create<UnreadStore>((set) => ({
  totalUnreadCount: 0,
  setTotalUnreadCount: (totalUnreadCount) => set({ totalUnreadCount }),
  readSignal: 0,
  bumpReadSignal: () => set((state) => ({ readSignal: state.readSignal + 1 })),
}));

export default unreadStore;
