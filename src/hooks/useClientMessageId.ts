import { useCallback, useRef } from "react";
import { hasFeature } from "../zustand/configStore";

// The API accepts 1 to 64 of [A-Za-z0-9_-]
const newClientMessageId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}${Math.random()
    .toString(36)
    .slice(2, 12)}`;

// True when a failed request may still have been stored: no response at all
// (timeout, connection dropped) or a server error. A 4xx was refused.
export const mayHaveBeenStored = (error: any) =>
  !error?.response || error.response.status >= 500;

// A clientMessageId per send, reused when the same message is sent again
// after a send whose outcome is unknown. The server keeps the first copy
// and answers the retry with it, so a timeout followed by a second tap no
// longer delivers the message twice.
//
// `key` identifies "the same message" (conversation, reply target and
// content). idFor() returns the id to send; settle() is called with the
// outcome: the id is kept for a retry only when the send may have landed.
const useClientMessageId = () => {
  const pending = useRef<{ key: string; id: string } | null>(null);

  const idFor = useCallback((key: string): string | undefined => {
    if (!hasFeature("clientMessageId")) return undefined;
    if (pending.current?.key === key) return pending.current.id;
    const id = newClientMessageId();
    pending.current = { key, id };
    return id;
  }, []);

  const settle = useCallback((key: string, error?: any) => {
    if (pending.current?.key !== key) return;
    if (!error || !mayHaveBeenStored(error)) pending.current = null;
  }, []);

  return { idFor, settle };
};

export default useClientMessageId;
