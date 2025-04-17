// API Base URL
export const API_URL =
  process.env.EXPO_PUBLIC_ENV === "development"
    ? process.env.EXPO_PUBLIC_API_DEV_URL
    : process.env.EXPO_PUBLIC_API_URL;

// API users profile image URL
export const API_PROFILE_IMAGE_URL = process.env.EXPO_PUBLIC_API_PROFILE_IMAGE_URL;