import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  exp?: number;
  [key: string]: any;
}

export const checkTokenExpiry = (token: string): boolean => {
  const decodedToken: DecodedToken = jwtDecode(token);

  // Extract expiration date from token
  const expiresAt = decodedToken.exp ? decodedToken.exp * 1000 : null;

  const currentDate = new Date().getTime();

  // Debugging logs
  if (expiresAt) {
    console.log(
      "Time Remaining:",
      Math.round((expiresAt - currentDate) / 1000 / 60),
      "minutes"
    );
  } else {
    console.log("JWT has no expiration date");
  }

  // Check if token is expired vs current date
  if (expiresAt) {
    return currentDate < expiresAt;
  }
  return false;
};
