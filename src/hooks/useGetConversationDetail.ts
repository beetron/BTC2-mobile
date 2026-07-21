import { useState, useCallback } from "react";
import axiosClient from "../utils/axiosClient";
import { Alert } from "react-native";
import useGetProfileImage from "./useGetProfileImage";
import { useNetwork } from "@/src/context/NetworkContext";
import conversationStore, {
  SelectedConversation,
} from "../zustand/conversationStore";

const useGetConversationDetail = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { getProfileImage } = useGetProfileImage();
  const { isConnected } = useNetwork();
  const { setSelectedConversation } = conversationStore();

  const getConversationDetail = useCallback(
    async (conversationId: string): Promise<boolean> => {
      if (!conversationId) return false;

      try {
        setIsLoading(true);

        if (!isConnected) {
          Alert.alert(
            "No Internet Connection",
            "Please check your connection to open this chat"
          );
          return false;
        }

        const res = await axiosClient.get(`/conversations/${conversationId}`);
        const detail = res.data;

        let avatarData: string | null = null;
        if (detail.avatar) {
          try {
            avatarData = await getProfileImage(detail.avatar);
          } catch (imageError) {
            console.error("Error loading conversation avatar:", imageError);
          }
        }

        // Group threads need a per-sender avatar for message bubbles (no
        // single "partner" to fall back on) -- resolve each member's
        // profile image once here, same pattern as avatarData above.
        let members = detail.members || [];
        if (detail.type === "group" && members.length > 0) {
          members = await Promise.all(
            members.map(async (member: any) => {
              if (!member.profileImage) return member;
              try {
                const profileImageData = await getProfileImage(member.profileImage);
                return { ...member, profileImageData };
              } catch (imageError) {
                console.error("Error loading member avatar:", imageError);
                return member;
              }
            })
          );
        }

        const selected: SelectedConversation = {
          conversationId: detail.conversationId,
          type: detail.type,
          name: detail.name,
          avatar: detail.avatar,
          avatarData,
          partnerId: detail.partnerId,
          members,
        };

        setSelectedConversation(selected);
        return true;
      } catch (error: any) {
        if (error.networkError === "TIMEOUT") {
          Alert.alert(
            "Connection Timeout",
            "Request took too long. Please try again"
          );
        } else if (error.networkError === "NO_INTERNET") {
          // Already alerted above
        } else {
          console.log(
            "Error fetching conversation detail:",
            error.response?.data?.error || error.message
          );
        }
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [isConnected, getProfileImage, setSelectedConversation]
  );

  return { getConversationDetail, isLoading };
};

export default useGetConversationDetail;
