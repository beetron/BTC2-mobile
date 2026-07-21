import { Locale } from "../context/LocaleContext";

// "17:36 (7/17/2025)" -- time is zero-padded (standard clock display),
// month/day deliberately are not (Intl "numeric" vs "2-digit").
export const formatConversationTimestamp = (
  isoString: string | null | undefined,
  locale: Locale
): string | null => {
  if (!isoString) return null;

  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return null;

  const time = new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);

  const day = new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).format(date);

  return `${time} (${day})`;
};
