import { Alert } from "react-native";

export const ProfileValidator = () => {
  // Function to check if length is at leats 6 chars
  const checkLength = (data: string): boolean => {
    if (!data) {
      console.log("No data passed to profileUpdateValidator");
      Alert.alert("Error", "Missing data");
      return false;
    }

    if (data.length < 6) {
      console.log(
        `Length must be between 6 and 20 characters. Current length: ${data.length}`
      );
      Alert.alert(
        "Error",
        `Length must be between 6 and 20 characters. Current length: ${data.length}`
      );
      return false;
    }
    return true;
  };

  // Function to check if data is only letters and numbers
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

  return { checkLength, checkAlphanumeric };
};

export default ProfileValidator;
