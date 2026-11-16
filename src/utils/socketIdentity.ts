// The id of this device's connected socket, sent as X-Socket-Id on API
// calls. With it the API skips only this socket when broadcasting our own
// sends, edits and deletes, so the user's other open devices still get the
// event. Kept here rather than read from socketService because
// socketService already imports axiosClient (an import cycle otherwise).
let currentSocketId: string | null = null;

export const setCurrentSocketId = (id: string | null | undefined) => {
  currentSocketId = id || null;
};

export const getCurrentSocketId = () => currentSocketId;

export const SOCKET_ID_HEADER = "X-Socket-Id";
