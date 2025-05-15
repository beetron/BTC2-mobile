import { View, Text, TouchableOpacity, Alert } from "react-native";
import * as SecureStore from "expo-secure-store";

// This componen is for debugging to force notification permissions
// and to delete the FCM token from SecureStore

const EditRemoveFcm = () => {
  const deleteFcmTokens = async () => {
    Alert.alert(
      "Delete FCM Token?",
      "",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "OK",
          onPress: async () => {
            console.log("Deleting FCM tokens...");
            await SecureStore.deleteItemAsync("fcm_token");
            console.log("FCM token deleted from SecureStore");
          },
        },
      ],
      { cancelable: false }
    );
  };

  return (
    <View className="flex-col pt-8">
      <View className="flex-row justify-center p-2">
        <Text className="text-btc100">Reset push notification</Text>
      </View>
      <View className="items-center">
        <TouchableOpacity
          className="bg-btc200 p-2 rounded-md"
          onPress={async () => {
            await deleteFcmTokens();
          }}
        >
          <Text className="text-white text-center">Delete FCM Tokens</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default EditRemoveFcm;
