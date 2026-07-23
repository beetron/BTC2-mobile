import { create } from "zustand";

interface UnreadStore {
  totalUnreadCount: number;
  setTotalUnreadCount: (count: number) => void;
}

const unreadStore = create<UnreadStore>((set) => ({
  totalUnreadCount: 0,
  setTotalUnreadCount: (totalUnreadCount) => set({ totalUnreadCount }),
}));

export default unreadStore;
