import AntDesign from "@expo/vector-icons/AntDesign";
import { Alert, TouchableOpacity, View } from "react-native";
import friendStore from "../zustand/friendStore";
import { MaterialIcons } from "@expo/vector-icons";
import useReportUser from "../hooks/useReportUser";

const ConversationReportButton = () => {
  const { messageId, selectedFriend } = friendStore();
  const { reportUser, isLoading } = useReportUser();

  const handleOnPress = async () => {
    console.log("Report button pressed");
    console.log("messageId:", messageId);
    console.log("selectedFriend:", selectedFriend);

    if (!messageId) {
      Alert.alert("No message selected", "Please select a message to report.");
      return;
    }

    if (!selectedFriend) {
      Alert.alert("Error", "Unable to identify user to report.");
      return;
    }

    // Show report options
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
      {
        text: "Other",
        onPress: () => showConfirmation("Other"),
      },
      {
        text: "Cancel",
        style: "cancel",
      },
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
          onPress: () => submitReport(reason),
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ]
    );
  };

  const submitReport = async (reason: string) => {
    // console.log("submitReport called with reason:", reason);

    if (!selectedFriend?._id) {
      Alert.alert("Error", "Unable to identify user to report.");
      return;
    }

    const success = await reportUser({
      reason,
      friendId: selectedFriend._id,
    });

    if (success) {
      Alert.alert(
        "Report Submitted",
        "Thank you for your report. Our team will review this within 24 hours.",
        [{ text: "OK" }]
      );
    }
  };

  return (
    <View>
      <TouchableOpacity onPress={handleOnPress} disabled={isLoading}>
        <MaterialIcons name="report-problem" size={34} color="#D4F1F4" />
      </TouchableOpacity>
    </View>
  );
};

export default ConversationReportButton;
