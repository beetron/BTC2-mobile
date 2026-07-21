import { create } from "zustand";

export interface ConversationMember {
  userId: string;
  role: "owner" | "member";
  joinedAt: string;
  nickname: string | null;
  profileImage: string | null;
  // Resolved at fetch time (useGetConversationDetail), same pattern as
  // SelectedConversation.avatarData -- used for per-sender group bubbles.
  profileImageData?: string | null;
  uniqueId: string | null;
}

export interface SelectedConversation {
  conversationId: string;
  type: "direct" | "group";
  name: string | null;
  avatar: string | null;
  avatarData?: string | null;
  partnerId: string | null;
  members: ConversationMember[];
}

export interface Message {
  _id: string;
  senderId: string;
  conversationId?: string;
  message?: string;
  imageFiles?: string[];
  createdAt: string;
}

interface ConversationStore {
  selectedConversation: SelectedConversation | null;
  setSelectedConversation: (conversation: SelectedConversation | null) => void;
  messages: Message[];
  setMessages: (messages: Message[]) => void;
  // Older pages append to the end -- index 0 stays the newest message,
  // matching the inverted FlatList used to render them.
  appendOlderMessages: (older: Message[]) => void;
  prependMessage: (message: Message) => void;
  nextCursor: string | null;
  setNextCursor: (cursor: string | null) => void;
  latestMessageId: string | null;
  setLatestMessageId: (id: string | null) => void;
  // Bumped to signal "refetch the open conversation's messages" to
  // useGetMessages without needing a second hook instance (e.g. after an
  // image upload, whose response doesn't carry enough to update the store
  // directly the way a text send's optimistic prepend does).
  refreshSignal: number;
  bumpRefreshSignal: () => void;
}

const conversationStore = create<ConversationStore>((set) => ({
  selectedConversation: null,
  setSelectedConversation: (selectedConversation) =>
    set({ selectedConversation }),
  messages: [],
  setMessages: (messages) => set({ messages }),
  appendOlderMessages: (older) =>
    set((state) => ({ messages: [...state.messages, ...older] })),
  prependMessage: (message) =>
    set((state) => ({ messages: [message, ...state.messages] })),
  nextCursor: null,
  setNextCursor: (nextCursor) => set({ nextCursor }),
  latestMessageId: null,
  setLatestMessageId: (id) => set({ latestMessageId: id }),
  refreshSignal: 0,
  bumpRefreshSignal: () => set((state) => ({ refreshSignal: state.refreshSignal + 1 })),
}));

export default conversationStore;
