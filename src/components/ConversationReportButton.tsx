import AntDesign from "@expo/vector-icons/AntDesign";
import { Alert, TouchableOpacity, View } from "react-native";
import friendStore from "../zustand/friendStore";
import { MaterialIcons } from "@expo/vector-icons";

const ConversationReportButton = () => {
  const { messageId } = friendStore();

  const handleOnPress = async () => {
    if (!messageId) {
      Alert.alert("No message selected", "Please select a message to report.");
      return;
    }

    // Show report options
    Alert.alert("Report User", "Why are you reporting this user?", [
      {
        text: "Inappropriate Content",
        onPress: () => submitReport("Inappropriate Content"),
      },
      {
        text: "Harassment",
        onPress: () => submitReport("Harassment"),
      },
      {
        text: "Spam",
        onPress: () => submitReport("Spam"),
      },
      {
        text: "Other",
        onPress: () => submitReport("Other"),
      },
      {
        text: "Cancel",
        style: "cancel",
      },
    ]);
  };

  const submitReport = async (reason: string) => {
    try {
      // TODO: Implement API call to report message
      console.log(`Reporting message ${messageId} for reason: ${reason}`);

      Alert.alert(
        "Report Submitted",
        "Thank you for your report. Our team will review this message within 24 hours.",
        [{ text: "OK" }]
      );
    } catch (error) {
      Alert.alert("Error", "Failed to submit report. Please try again.");
    }
  };

  return (
    <View>
      <TouchableOpacity onPress={handleOnPress}>
        <MaterialIcons name="report-problem" size={34} color="#D4F1F4" />
      </TouchableOpacity>
    </View>
  );
};

export default ConversationReportButton;
