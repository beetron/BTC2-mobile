import { Alert } from "react-native";

// Coming back to the app offline refreshes the friend list, groups and
// friend requests at once, and each one alerted on its own, so two or
// three "No internet" alerts stacked up. Alerts sharing a `group` show
// once within the window.
const WINDOW_MS = 5000;
const lastShown = new Map<string, number>();

export const alertOnce = (group: string, title: string, message?: string) => {
  const now = Date.now();
  if (now - (lastShown.get(group) ?? 0) < WINDOW_MS) return;
  lastShown.set(group, now);
  Alert.alert(title, message);
};
