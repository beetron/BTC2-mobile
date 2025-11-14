import axiosClient from "@/src/utils/axiosClient";
import { useState } from "react";
import { Alert } from "react-native";
import { useNetwork } from "@/src/context/NetworkContext";

interface ReportUserData {
  reason: string;
  friendId: string;
}

const useReportUser = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { isConnected } = useNetwork();

  const reportUser = async (data: ReportUserData): Promise<boolean> => {
    try {
      setIsLoading(true);

      if (!isConnected) {
        Alert.alert(
          "No Internet Connection",
          "Please check your connection to report users"
        );
        return false;
      }

      // API call to report user
      console.log("Making API call to /users/reportuser with data:", data);
      const response = await axiosClient.post("/users/reportuser", data);
      console.log("API response status:", response.status);

      if (response.status === 200) {
        console.log("useReportUser successful");
        return true;
      }
      return false;
    } catch (error: any) {
      if (error.networkError === "TIMEOUT") {
        Alert.alert(
          "Connection Timeout",
          "Request took too long. Please try again"
        );
      } else if (error.networkError === "NO_INTERNET") {
        // Already alerted in pre-flight check
      } else if (error.data && error.data.error) {
        console.error("Error reporting user:", error.data.message);
        Alert.alert("Error", error.data.message);
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { reportUser, isLoading };
};

export default useReportUser;
