import React from "react";
import { View, TouchableOpacity, Alert } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import useDeleteMessages from "@/src/hooks/useDeleteMessages";
import useReportUser from "@/src/hooks/useReportUser";
import useBlockUser from "@/src/hooks/useBlockUser";
import friendStore from "@/src/zustand/friendStore";
import { useRouter } from "expo-router";

const ConversationActionMenu = () => {
  const { deleteMessages } = useDeleteMessages();
  const { reportUser } = useReportUser();
  const { blockUser } = useBlockUser();
  const {
    messageId,
    selectedFriend,
    setMessageId,
    setShouldRender,
    setSelectedFriend,
    setMessages,
  } = friendStore();
  const router = useRouter();

  const handleDelete = () => {
    if (!messageId) {
      Alert.alert("No messages to delete");
      return;
    }

    Alert.alert("Delete Messages", "Delete Messages?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "OK",
        onPress: async () => {
          const success = await deleteMessages(messageId);
          if (success) {
            // Toggle global state so messages refresh (done by caller)
            setShouldRender();
            setMessageId(null);
          }
        },
      },
    ]);
  };

  const handleReport = () => {
    if (!messageId) {
      Alert.alert("No messages selected", "Please select a message to report.");
      return;
    }

    if (!selectedFriend) {
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
            if (!selectedFriend?._id) {
              Alert.alert("Error", "Unable to identify user to report.");
              return;
            }
            const success = await reportUser({
              reason,
              friendId: selectedFriend._id,
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
    if (!selectedFriend) {
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
            const success = await blockUser(selectedFriend._id);
            if (success) {
              // Clear conversation state and go back to friends list
              setMessages([]);
              setSelectedFriend(null);
              setShouldRender();
              // Replace current route with members index to show FriendContainer
              router.replace("/members");
            }
          },
        },
      ]
    );
  };

  const handleMenu = () => {
    Alert.alert("Actions", undefined, [
      { text: "Delete Messages", onPress: handleDelete },
      { text: "Report User", onPress: handleReport },
      { text: "Block User", onPress: handleBlock },
      // Blank spacer row for visual separation before Cancel
      { text: "\u00a0", onPress: () => {} },
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
