import { Alert } from "react-native";
import axiosClient from "../utils/axiosClient";
import { useState } from "react";
import { useNetwork } from "@/src/context/NetworkContext";

const useCreateGroup = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { isConnected } = useNetwork();

  // POST /conversations/group returns a raw (unpopulated) conversation doc
  // -- only its _id is needed since the conversation screen always
  // re-resolves its own detail from the route param regardless of
  // navigation origin.
  const createGroup = async (
    name: string,
    memberIds: string[]
  ): Promise<string | null> => {
    try {
      setIsLoading(true);

      if (!isConnected) {
        Alert.alert(
          "No Internet Connection",
          "Please check your connection and try again"
        );
        return null;
      }

      const response = await axiosClient.post("/conversations/group", {
        name,
        memberIds,
      });

      return response.data._id;
    } catch (error: any) {
      if (error.networkError === "TIMEOUT") {
        Alert.alert(
          "Connection Timeout",
          "Request took too long. Please try again"
        );
      } else if (error.networkError === "NO_INTERNET") {
        // already alerted above
      } else if (error.response?.data?.error) {
        Alert.alert("Error", error.response.data.error);
      } else {
        Alert.alert("Error", "Failed to create group");
      }
      console.error("Error in useCreateGroup:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { createGroup, isLoading };
};

export default useCreateGroup;
