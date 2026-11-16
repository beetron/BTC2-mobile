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

// The quoted message carried on every reply (API 2.0). Read live by the
// server, so it follows edits and deletes of the original -- but those
// don't touch the reply itself, so the client patches loaded quotes too
// (see upsertMessages).
export interface ReplyPreview {
  _id: string;
  senderId: string | null;
  message: string | null; // at most REPLY_PREVIEW_LENGTH characters
  hasImages: boolean;
  // First photo of the original, for a thumbnail (API 2.1, `replyImage`).
  // null when it has no photos, is deleted, or its photos expired;
  // undefined from an older API that doesn't send it.
  imageFile?: string | null;
  imagesExpired?: boolean; // the original's photo files were removed (API 2.1)
  deleted: boolean; // original deleted for everyone
  unavailable: boolean; // original no longer exists at all
}

export interface Message {
  _id: string;
  senderId: string;
  conversationId?: string;
  // null on a tombstone (deleted for everyone)
  message?: string | null;
  imageFiles?: string[];
  createdAt: string;
  updatedAt?: string;
  replyTo?: ReplyPreview;
  editedAt?: string | null;
  deletedAt?: string | null;
  // Set once the photo files were removed after the retention period;
  // imageFiles keeps the names (API 2.1, `imageExpiry`)
  imagesExpiredAt?: string | null;
}

export type ComposerState =
  | { mode: "reply"; target: Message }
  | { mode: "edit"; target: Message }
  | null;

// Same cut the API makes for reply previews
export const REPLY_PREVIEW_LENGTH = 200;

export const isTombstone = (m: Pick<Message, "deletedAt">) => !!m.deletedAt;

const previewOf = (m: Message): ReplyPreview => {
  if (isTombstone(m)) {
    return {
      _id: m._id,
      senderId: m.senderId,
      message: null,
      hasImages: false,
      imageFile: null,
      imagesExpired: false,
      deleted: true,
      unavailable: false,
    };
  }
  // Same rules as the API's preview, so a quote patched here matches what
  // the next fetch returns
  const text = m.message || "";
  const hasImages = (m.imageFiles?.length ?? 0) > 0;
  const imagesExpired = hasImages && !!m.imagesExpiredAt;
  return {
    _id: m._id,
    senderId: m.senderId,
    message: text.slice(0, REPLY_PREVIEW_LENGTH),
    hasImages,
    imageFile: hasImages && !imagesExpired ? m.imageFiles![0] : null,
    imagesExpired,
    deleted: false,
    unavailable: false,
  };
};

const isNewer = (a: Message, b: Message) =>
  a.createdAt > b.createdAt || (a.createdAt === b.createdAt && a._id > b._id);

// Merges created / edited / deleted messages into a newest-first list.
// - already loaded: replaced in place
// - newer than the oldest loaded: inserted in order (normally at the top)
// - older than everything loaded: skipped, paging brings it in later
// Then every loaded reply quoting a changed message gets a fresh preview.
export const mergeMessages = (current: Message[], changed: Message[]): Message[] => {
  if (changed.length === 0) return current;
  const changedById = new Map(changed.map((m) => [m._id, m]));

  let next = current.map((m) => changedById.get(m._id) ?? m);
  const known = new Set(current.map((m) => m._id));
  const oldest = current[current.length - 1];

  const added = changed.filter(
    (m) => !known.has(m._id) && (!oldest || isNewer(m, oldest))
  );
  if (added.length > 0) {
    next = [...next, ...added].sort((a, b) => (isNewer(a, b) ? -1 : 1));
  }

  next = next.map((m) => {
    const quoted = m.replyTo && changedById.get(m.replyTo._id);
    return quoted ? { ...m, replyTo: previewOf(quoted) } : m;
  });

  return next;
};

interface ConversationStore {
  selectedConversation: SelectedConversation | null;
  setSelectedConversation: (conversation: SelectedConversation | null) => void;
  messages: Message[];
  setMessages: (messages: Message[]) => void;
  // Older pages append to the end -- index 0 stays the newest message,
  // matching the inverted FlatList used to render them.
  appendOlderMessages: (older: Message[]) => void;
  prependMessage: (message: Message) => void;
  // Sends, uploads, edits, deletes and change syncs all land here, so a
  // message arriving both in an HTTP response and from a sync is only
  // ever shown once.
  upsertMessages: (changed: Message[]) => void;
  nextCursor: string | null;
  setNextCursor: (cursor: string | null) => void;
  latestMessageId: string | null;
  setLatestMessageId: (id: string | null) => void;
  // Position in GET /conversations/:id/messages/changes for the open
  // conversation. `since` is the baseline taken from the first page (server
  // time); `cursor` replaces it after the first sync.
  changesSince: string | null;
  changesCursor: string | null;
  setChangesPosition: (pos: { since?: string | null; cursor?: string | null }) => void;
  // Newest message the server has as read for the open conversation:
  // loading the newest page marks it, then useMarkConversationRead moves
  // it forward as messages arrive while the chat is open.
  markedReadId: string | null;
  setMarkedReadId: (id: string | null) => void;
  // Set while the user is leaving this group themselves, so the
  // conversation:memberRemoved that comes back isn't shown as "you were
  // removed"
  leavingConversationId: string | null;
  setLeavingConversationId: (id: string | null) => void;
  // A direct conversation the server deleted because both sides cleared
  // it (from this device's own clear-history response). The open chat
  // moves to a fresh conversation, as it does on conversation:deleted.
  deletedConversationId: string | null;
  setDeletedConversationId: (id: string | null) => void;
  // Reply / edit mode of the composer
  composer: ComposerState;
  startReply: (target: Message) => void;
  startEdit: (target: Message) => void;
  clearComposer: () => void;
  // Bumped to signal "refetch the open conversation's messages" to
  // useGetMessages without needing a second hook instance.
  refreshSignal: number;
  bumpRefreshSignal: () => void;
}

const conversationStore = create<ConversationStore>((set) => ({
  selectedConversation: null,
  setSelectedConversation: (selectedConversation) =>
    set((state) =>
      state.selectedConversation?.conversationId === selectedConversation?.conversationId
        ? { selectedConversation }
        : {
            // Everything tied to the previous conversation goes. A stale
            // latestMessageId let "Delete messages" in a chat whose messages
            // hadn't loaded yet clear the PREVIOUS chat (the server finds
            // the conversation from the message id), and a stale nextCursor
            // paged the new chat with the old one's cursor.
            selectedConversation,
            messages: [],
            latestMessageId: null,
            nextCursor: null,
            composer: null,
            changesSince: null,
            changesCursor: null,
            markedReadId: null,
          }
    ),
  messages: [],
  setMessages: (messages) => set({ messages }),
  appendOlderMessages: (older) =>
    set((state) => ({ messages: mergeOlder(state.messages, older) })),
  prependMessage: (message) =>
    set((state) => ({ messages: mergeMessages(state.messages, [message]) })),
  upsertMessages: (changed) =>
    set((state) => {
      const messages = mergeMessages(state.messages, changed);
      // Drop a reply / edit whose target was just deleted for everyone
      const target = state.composer?.target;
      const targetChange = target && changed.find((m) => m._id === target._id);
      const composer =
        targetChange && isTombstone(targetChange) ? null : state.composer;
      return {
        messages,
        composer,
        latestMessageId: messages[0]?._id ?? null,
      };
    }),
  nextCursor: null,
  setNextCursor: (nextCursor) => set({ nextCursor }),
  latestMessageId: null,
  setLatestMessageId: (id) => set({ latestMessageId: id }),
  changesSince: null,
  changesCursor: null,
  setChangesPosition: ({ since, cursor }) =>
    set((state) => ({
      changesSince: since !== undefined ? since : state.changesSince,
      changesCursor: cursor !== undefined ? cursor : state.changesCursor,
    })),
  markedReadId: null,
  setMarkedReadId: (markedReadId) => set({ markedReadId }),
  leavingConversationId: null,
  setLeavingConversationId: (leavingConversationId) => set({ leavingConversationId }),
  deletedConversationId: null,
  setDeletedConversationId: (deletedConversationId) => set({ deletedConversationId }),
  composer: null,
  startReply: (target) => set({ composer: { mode: "reply", target } }),
  startEdit: (target) => set({ composer: { mode: "edit", target } }),
  clearComposer: () => set({ composer: null }),
  refreshSignal: 0,
  bumpRefreshSignal: () => set((state) => ({ refreshSignal: state.refreshSignal + 1 })),
}));

// An older page may overlap what a sync already inserted; keep one copy
const mergeOlder = (current: Message[], older: Message[]) => {
  const known = new Set(current.map((m) => m._id));
  return [...current, ...older.filter((m) => !known.has(m._id))];
};

export default conversationStore;

// True while `conversationId` is still the open chat. Anything that awaits
// the network and then writes into the store checks this first: by the
// time a send, upload or page load finishes the user may have gone back
// and opened another chat, and the result must not land in that one.
export const isConversationOpen = (conversationId: string | undefined): boolean =>
  !!conversationId &&
  conversationStore.getState().selectedConversation?.conversationId === conversationId;
