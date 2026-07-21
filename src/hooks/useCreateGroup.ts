import { Alert } from "react-native";
import axiosClient from "../utils/axiosClient";
import { useState } from "react";
import { useNetwork } from "@/src/context/NetworkContext";
import { useTranslation } from "@/src/hooks/useTranslation";

const useCreateGroup = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { isConnected } = useNetwork();
  const { t } = useTranslation();

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
        Alert.alert(t("errors.noInternetTitle"), t("errors.noInternetGeneric"));
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
          t("errors.connectionTimeoutTitle"),
          t("errors.connectionTimeoutMessage")
        );
      } else if (error.networkError === "NO_INTERNET") {
        // already alerted above
      } else if (error.response?.data?.error) {
        Alert.alert(t("common.error"), error.response.data.error);
      } else {
        Alert.alert(t("common.error"), t("group.createFailed"));
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
