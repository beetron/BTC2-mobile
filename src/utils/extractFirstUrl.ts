// Scheme-qualified only (https?://...) -- every match here is a substring
// react-native-autolink will also linkify, and the backend's own /link-preview
// validation requires an http(s) scheme anyway, so a narrower net than
// Autolink's full bare-domain matching is fine for preview-card purposes.
const URL_RE = /https?:\/\/[^\s<>"'`]+/;

// Trailing sentence punctuation is almost never part of the URL itself.
const TRAILING_PUNCT_RE = /[.,!?;:'"]+$/;

export const extractFirstUrl = (text?: string | null): string | null => {
  if (!text) return null;

  const match = text.match(URL_RE);
  if (!match) return null;

  let url = match[0];

  // Strip a trailing unbalanced ")" (e.g. a URL wrapped in parens) before
  // trimming punctuation, then trim any remaining sentence punctuation.
  while (url.length > 0) {
    if (url.endsWith(")") && (url.match(/\(/g)?.length ?? 0) < (url.match(/\)/g)?.length ?? 0)) {
      url = url.slice(0, -1);
      continue;
    }
    if (TRAILING_PUNCT_RE.test(url)) {
      url = url.replace(TRAILING_PUNCT_RE, "");
      continue;
    }
    break;
  }

  return url || null;
};

export default extractFirstUrl;
