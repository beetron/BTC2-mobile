import { create } from "zustand";

interface FriendRequestsStore {
  pendingCount: number;
  setPendingCount: (count: number) => void;
}

const friendRequestsStore = create<FriendRequestsStore>((set) => ({
  pendingCount: 0,
  setPendingCount: (pendingCount) => set({ pendingCount }),
}));

export default friendRequestsStore;
