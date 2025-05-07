import axiosClient from "../utils/axiosClient";
import { useState } from "react";
import { Alert } from "react-native";

const useAddFriend = () => {
  const [loading, setLoading] = useState(false);

  const addFriend = async (friendUniqueId: string): Promise<boolean> => {
    try {
      setLoading(true);
      if (!friendUniqueId) return false;

      const response = await axiosClient.put(
        `/users/addfriend/${friendUniqueId}`
      );
      if (response.status === 200) {
        Alert.alert("Friend request sent");
        return true;
      }
      return false;
    } catch (error: any) {
      console.log("Error in useAddFriend: ", error);
      if (error.response && error.response.data && error.response.data.error) {
        Alert.alert("Error", error.response.data.error);
      } else {
        Alert.alert("Error", "An error occurred while adding friend.");
      }
      return false;
    } finally {
      setLoading(false);
    }
  };
  return { addFriend, loading };
};

export default useAddFriend;
