import { create } from "zustand";

interface Friend {
  _id: string;
  nickname: string;
  profilePhoto: string;
  updatedAt?: string;
}

interface FriendStore {
  selectedFriend: Friend | null;
  setSelectedFriend: (friend: Friend | null) => void;
  messages: string[];
  setMessages: (messages: string[]) => void;
  shouldRender: boolean; // used for useEffect to reload via socket event
  setShouldRender: () => void;
}

const useFriendStore = create<FriendStore>((set) => ({
  selectedFriend: null,
  setSelectedFriend: (selectedFriend) => set({ selectedFriend }),
  messages: [],
  setMessages: (messages) => set({ messages }),
  shouldRender: false,
  setShouldRender: () =>
    set((state) => ({ shouldRender: !state.shouldRender })),
}));

export default useFriendStore;
