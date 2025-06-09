import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  exp?: number;
  [key: string]: any;
}

export const checkTokenExpiry = (token: string): boolean => {
  try {
    const decodedToken: DecodedToken = jwtDecode(token);

    // Extract expiration date from token
    const expiresAt = decodedToken.exp ? decodedToken.exp * 1000 : null;
    const currentDate = new Date().getTime();

    // Debugging logs
    // if (expiresAt) {
    //   const timeRemaining = Math.round((expiresAt - currentDate) / 1000 / 60);
    //   console.log("Time Remaining:", timeRemaining, "minutes");
    //   console.log("Current time:", new Date(currentDate).toISOString());
    //   console.log("Token expires at:", new Date(expiresAt).toISOString());
    // } else {
    //   console.log("JWT has no expiration date");
    // }

    // Check if token is expired against current date time
    if (expiresAt) {
      return currentDate < expiresAt;
    }
    return false;
  } catch (error) {
    console.error("Error decoding token:", error);
    return false;
  }
};
