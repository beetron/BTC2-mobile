// The API answers in English (`{ error: "..." }`). Errors a user can act on
// are mapped to translation keys here, so a Japanese UI never shows the
// raw English text; anything unknown falls back to the caller's own
// localized message.
const KNOWN_ERRORS: Record<string, string> = {
  "User not found": "errors.server.userNotFound",
  "User not found, or no longer a user": "errors.server.userNotFound",
  "User or Friend not found": "errors.server.userNotFound",
  "Cannot add yourself": "errors.server.cannotAddYourself",
  "Friend request already sent": "errors.server.requestAlreadySent",
  "Already friends": "errors.server.alreadyFriends",
  "Unblock this user first": "errors.server.unblockFirst",
  "No friend request from this user": "errors.server.noFriendRequest",
  "User not in friend list": "errors.server.notInFriendList",
  "User already blocked": "errors.server.alreadyBlocked",
  "User is not blocked": "errors.server.notBlocked",
  "Cannot block yourself": "errors.server.cannotBlockYourself",
  "You cannot report yourself": "errors.server.cannotReportYourself",
  "You can only message friends": "errors.server.onlyMessageFriends",
  "Cannot start a conversation with this user": "errors.server.cannotStartConversation",
  "You can only add your own friends to a group": "errors.server.onlyAddOwnFriends",
  "Only the owner can update this group": "errors.server.ownerOnly",
  "Only the owner can remove other members": "errors.server.ownerOnly",
  "Not a member of this conversation": "errors.server.notAMember",
  "Conversation not found": "errors.server.conversationNotFound",
  "Username is taken": "errors.server.usernameTaken",
  "UniqueId already taken": "errors.server.uniqueIdTaken",
  "Email address is already in use": "errors.server.emailTaken",
  "Email already taken": "errors.server.emailTaken",
  "Friend's Unique ID incorrect": "errors.server.inviterIdIncorrect",
  "Invalid login information": "errors.server.invalidLogin",
  "Password is incorrect": "errors.server.passwordIncorrect",
  "Current password is incorrect": "errors.server.passwordIncorrect",
  "New password cannot be the same as the current password": "errors.server.samePassword",
  "Email not found": "errors.server.emailNotFound",
  "Username or email not found": "errors.server.usernameOrEmailNotFound",
  "Too many requests, please try again later": "errors.server.tooManyRequests",
};

type Translate = (key: string, vars?: Record<string, string | number>) => string;

// The server's error text, from an axios error, an axios response, or a
// plain string
const rawError = (source: any): string | undefined => {
  if (typeof source === "string") return source;
  return source?.response?.data?.error ?? source?.data?.error ?? source?.error;
};

// Localized text for a server error, or t(fallbackKey) when it isn't one
// the user can do anything about
export const serverErrorMessage = (source: any, t: Translate, fallbackKey: string): string => {
  const raw = rawError(source);
  const key = raw ? KNOWN_ERRORS[raw] : undefined;
  return t(key ?? fallbackKey);
};
