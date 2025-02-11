// Get API URL
export const API_URL =
  process.env.EXPO_PUBLIC_ENV === "development"
    ? process.env.EXPO_PUBLIC_API_DEV_URL
    : process.env.EXPO_PUBLIC_API_URL;
