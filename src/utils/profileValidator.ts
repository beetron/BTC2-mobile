import { Alert } from "react-native";

export const profileValidator = () => {
  // Check if passwords are matching
  const checkPassword = (
    password: string,
    confirmPassword: string
  ): boolean => {
    if (password !== confirmPassword) {
      console.log("Passwords do not match");
      Alert.alert("Error", "Passwords do not match");
      return false;
    }
    return true;
  };

  // Check if username min max length is met
  const checkLengthUsername = (data: string): boolean => {
    if (data.length < 6 || data.length > 20) {
      console.log("Username must be between 6 and 20 characters");
      Alert.alert("Error", "Username must be between 6 and 20 characters");
      return false;
    }
    return true;
  };

  // Check if password min max length is met
  const checkLengthPassword = (data: string): boolean => {
    if (data.length < 6 || data.length > 72) {
      console.log("Password must be between 6 and 72 characters");
      Alert.alert("Error", "Password must be between 6 and 72 characters");
      return false;
    }
    return true;
  };

  // Check if data is only using alphanumeric
  const checkAlphanumeric = (data: string): boolean => {
    const regex = /^[a-zA-Z0-9]+$/;
    if (!regex.test(data)) {
      console.log("Only letters and numbers are allowed");
      Alert.alert("Error", "Only letters and numbers are allowed");
      return false;
    }
    return true;
  };

  // Check if email is valid
  const checkEmailRegex = (email: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(email)) {
      console.log("Invalid email format");
      Alert.alert("Error", "Invalid email format");
      return false;
    }
    return true;
  };

  return {
    checkLengthUsername,
    checkLengthPassword,
    checkAlphanumeric,
    checkPassword,
    checkEmailRegex,
  };
};

export default profileValidator;
