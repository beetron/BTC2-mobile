import { create } from "zustand";

// Features the API advertises in GET /config (`features`: string[]). A
// feature that is missing -- or not known yet -- counts as off, so the
// matching UI stays hidden against an API that can't serve it.
export type ServerFeature =
  | "clientMessageId"
  | "reply"
  | "edit"
  | "delete"
  | "messageChanges"
  | "markRead";

interface ConfigStore {
  features: string[] | null; // null: never fetched and nothing stored
  setFeatures: (features: string[] | null) => void;
}

const configStore = create<ConfigStore>((set) => ({
  features: null,
  setFeatures: (features) => set({ features }),
}));

export const useHasFeature = (feature: ServerFeature) =>
  configStore((state) => !!state.features?.includes(feature));

export const hasFeature = (feature: ServerFeature) =>
  !!configStore.getState().features?.includes(feature);

export default configStore;
