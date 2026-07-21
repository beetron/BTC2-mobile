import axiosClient from "../utils/axiosClient";
import { useState } from "react";
import { Alert } from "react-native";
import { useNetwork } from "@/src/context/NetworkContext";
import { useTranslation } from "@/src/hooks/useTranslation";

const useAddFriend = () => {
  const [loading, setLoading] = useState(false);
  const { isConnected } = useNetwork();
  const { t } = useTranslation();

  const addFriend = async (friendUniqueId: string): Promise<boolean> => {
    try {
      setLoading(true);
      if (!friendUniqueId) return false;

      if (!isConnected) {
        Alert.alert(t("errors.noInternetTitle"), t("errors.noInternetGeneric"));
        return false;
      }

      const response = await axiosClient.put(
        `/users/addfriend/${friendUniqueId}`
      );
      if (response.status === 200) {
        Alert.alert(t("friends.requestSentSuccess"));
        return true;
      }
      return false;
    } catch (error: any) {
      console.log("Error in useAddFriend: ", error);

      if (error.networkError === "TIMEOUT") {
        Alert.alert(
          t("errors.connectionTimeoutTitle"),
          t("errors.connectionTimeoutMessage")
        );
      } else if (error.networkError === "NO_INTERNET") {
        // Already alerted in pre-flight check
      } else if (
        error.response &&
        error.response.data &&
        error.response.data.error
      ) {
        Alert.alert(t("common.error"), error.response.data.error);
      } else {
        Alert.alert(t("common.error"), t("friends.addFriendGenericError"));
      }
      return false;
    } finally {
      setLoading(false);
    }
  };
  return { addFriend, loading };
};

export default useAddFriend;
