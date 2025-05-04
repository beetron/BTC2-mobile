import { create } from "zustand";

interface Friend {
  _id: string;
  nickname: string;
  profileImage: string;
  profileImageData?: string;
  unreadCount: number;
  updatedAt?: string;
}

interface Message {
  senderId: string;
  nickname: string;
  message: string;
  createdAt: string;
}

interface FriendStore {
  selectedFriend: Friend | null;
  setSelectedFriend: (friend: Friend | null) => void;
  messages: Message[];
  setMessages: (messages: Message[]) => void;
  shouldRender: boolean; // used for useEffect to reload via socket event
  setShouldRender: () => void;
  messageId: string | null;
  setMessageId: (id: string | null) => void;
}

const friendStore = create<FriendStore>((set) => ({
  selectedFriend: null,
  setSelectedFriend: (selectedFriend) => set({ selectedFriend }),
  messages: [],
  setMessages: (messages) => set({ messages }),
  shouldRender: false,
  setShouldRender: () =>
    set((state) => ({ shouldRender: !state.shouldRender })),
  messageId: null,
  setMessageId: (id) => set({ messageId: id }),
}));

export default friendStore;
