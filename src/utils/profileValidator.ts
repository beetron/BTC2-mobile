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

  // Check if length is at least 6 chars
  const checkLength = (data: string): boolean => {
    if (!data) {
      console.log("No data passed to profileUpdateValidator");
      Alert.alert("Error", "Missing data");
      return false;
    }

    if (data.length < 6) {
      console.log("Length must be between 6 and 20 characters");
      Alert.alert("Error", "Length must be between 6 and 20 characters");
      return false;
    }
    return true;
  };

  // Check if data is only using alphanumeric
  const checkAlphanumeric = (data: string): boolean => {
    if (!data) {
      console.log("No data passed to profileUpdateValidator");
      Alert.alert("Error", "Missing data");
      return false;
    }

    const regex = /^[a-zA-Z0-9]+$/;
    if (!regex.test(data)) {
      console.log("Only letters and numbers are allowed");
      Alert.alert("Error", "Only letters and numbers are allowed");
      return false;
    }
    return true;
  };

  return { checkLength, checkAlphanumeric, checkPassword };
};

export default profileValidator;
