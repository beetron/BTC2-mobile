import { Alert } from "react-native";
import axiosClient from "../utils/axiosClient";
import { useState } from "react";

const useAcceptFriend = () => {
  const [isLoading, setIsLoading] = useState(false);

  const acceptFriend = async (uniqueId: string): Promise<boolean> => {
    try {
      setIsLoading(true);

      const response = await axiosClient.put(`/users/acceptfriend/${uniqueId}`);

      if (response.status === 200) {
        Alert.alert("Friend accepted");
        return true;
      }
      return false;
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.error) {
        Alert.alert("Error", error.response.data.error);
        console.error("Error in useAcceptFriend: ", error);
      } else {
        Alert.alert("Error", "An unexpected error occurred.");
        console.error("Unexpected error in useAcceptFriend: ", error);
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { acceptFriend, isLoading };
};

export default useAcceptFriend;
