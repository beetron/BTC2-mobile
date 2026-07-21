import React from "react";
import { View, TouchableOpacity, Alert } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import useDeleteMessages from "@/src/hooks/useDeleteMessages";
import useReportUser from "@/src/hooks/useReportUser";
import useBlockUser from "@/src/hooks/useBlockUser";
import conversationStore from "@/src/zustand/conversationStore";
import { useRouter } from "expo-router";

// Direct chats: Delete Messages / Report User / Block User (report/block
// need selectedConversation.partnerId, which is null for groups).
// Group chats: Delete Messages / Group Settings -- member management
// (add/remove/rename/leave) lives in the groupSettings screen instead of
// being duplicated in this menu.
const ConversationActionMenu = () => {
  const { deleteMessages } = useDeleteMessages();
  const { reportUser } = useReportUser();
  const { blockUser } = useBlockUser();
  const {
    latestMessageId,
    selectedConversation,
    setLatestMessageId,
    setSelectedConversation,
    setMessages,
  } = conversationStore();
  const router = useRouter();

  const handleDelete = () => {
    if (!latestMessageId) {
      Alert.alert("No messages to delete");
      return;
    }

    Alert.alert("Delete Messages", "Delete Messages?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "OK",
        onPress: async () => {
          const success = await deleteMessages(latestMessageId);
          if (success) {
            setLatestMessageId(null);
          }
        },
      },
    ]);
  };

  const handleReport = () => {
    if (!latestMessageId) {
      Alert.alert("No messages selected", "Please select a message to report.");
      return;
    }

    if (!selectedConversation?.partnerId) {
      Alert.alert("Error", "Unable to identify user to report.");
      return;
    }

    Alert.alert("Report User", "Why are you reporting this user?", [
      {
        text: "Inappropriate Content",
        onPress: () => showConfirmation("Inappropriate Content"),
      },
      {
        text: "Harassment",
        onPress: () => showConfirmation("Harassment"),
      },
      {
        text: "Spam",
        onPress: () => showConfirmation("Spam"),
      },
      { text: "Other", onPress: () => showConfirmation("Other") },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const showConfirmation = (reason: string) => {
    Alert.alert(
      "Confirm Report",
      `Are you sure you want to report this user for "${reason}"?`,
      [
        {
          text: "Report",
          style: "destructive",
          onPress: async () => {
            if (!selectedConversation?.partnerId) {
              Alert.alert("Error", "Unable to identify user to report.");
              return;
            }
            const success = await reportUser({
              reason,
              friendId: selectedConversation.partnerId,
            });
            if (success) {
              Alert.alert("Report Submitted", "Thank you for your report.");
            }
          },
        },
        { text: "Cancel", style: "cancel" },
      ]
    );
  };

  const handleBlock = () => {
    if (!selectedConversation?.partnerId) {
      Alert.alert("Error", "Unable to identify user to block.");
      return;
    }

    Alert.alert(
      "Block User",
      "Blocking a user will remove them from your friend list and delete conversations. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Block",
          style: "destructive",
          onPress: async () => {
            const success = await blockUser(selectedConversation.partnerId!);
            if (success) {
              // Clear conversation state and go back to friends list
              setMessages([]);
              setSelectedConversation(null);
              // Replace current route with members index to show the conversation list
              router.replace("/members");
            }
          },
        },
      ]
    );
  };

  const handleMenu = () => {
    if (selectedConversation?.type === "group") {
      Alert.alert("Actions", undefined, [
        { text: "Delete Messages", onPress: handleDelete },
        { text: "Group Settings", onPress: () => router.push("/members/groupSettings") },
        { text: "Cancel", style: "cancel" },
      ]);
      return;
    }

    Alert.alert("Actions", undefined, [
      { text: "Delete Messages", onPress: handleDelete },
      { text: "Report User", onPress: handleReport },
      { text: "Block User", onPress: handleBlock },
      // Blank spacer row for visual separation before Cancel
      { text: " ", onPress: () => {} },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  return (
    <View>
      <TouchableOpacity onPress={handleMenu}>
        <MaterialIcons name="more-horiz" size={40} color="#D4F1F4" />
      </TouchableOpacity>
    </View>
  );
};

export default ConversationActionMenu;
