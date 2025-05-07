import AntDesign from "@expo/vector-icons/AntDesign";
import { Alert, TouchableOpacity, View } from "react-native";
import useDeleteMessages from "@/src/hooks/useDeleteMessages";
import friendStore from "../zustand/friendStore";

const ConversationDeleteButton = () => {
  const { isLoading, deleteMessages } = useDeleteMessages();
  const { setShouldRender, messageId, setMessageId } = friendStore();

  const handleOnPress = async () => {
    if (!messageId) {
      Alert.alert("No messages to delete");
      return;
    }
    // Alert to confirm deletion
    const confirmDelete = await new Promise((resolve) => {
      Alert.alert("", "Delete Message", [
        { text: "Cancel", onPress: () => resolve(false), style: "cancel" },
        { text: "OK", onPress: () => resolve(true) },
      ]);
    });

    if (confirmDelete) {
      if (messageId) {
        const success = await deleteMessages(messageId);
        if (success) {
          setShouldRender();
          setMessageId(null);
        }
      }
    }
  };
  return (
    <View className="flex-1 items-end justify-end mb-2 mr-4">
      <TouchableOpacity onPress={handleOnPress} disabled={isLoading}>
        <AntDesign name="delete" size={36} color="white" />
      </TouchableOpacity>
    </View>
  );
};

export default ConversationDeleteButton;
