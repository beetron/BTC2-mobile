// One-line preview of message text for quotes, the "Replying to" bar and
// accessibility labels. Collapses newlines and runs of spaces (a message
// starting with blank lines would otherwise preview as empty lines) and
// caps the length, so a 10,000-character message never gets laid out just
// to be truncated to one or two lines.
export const toSnippet = (text: string | null | undefined, max = 200): string => {
  if (!text) return "";
  const flat = text.replace(/\s+/g, " ").trim();
  return flat.length > max ? `${flat.slice(0, max).trimEnd()}…` : flat;
};
