import { View, Text, TouchableOpacity, Alert } from "react-native";
import * as SecureStore from "expo-secure-store";
import { useAuth } from "@/src/context/AuthContext";

const EditRemoveFcm = () => {
  const { authState } = useAuth();

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
            await SecureStore.deleteItemAsync("fcm_token_timestamp");
            console.log("FCM tokens deleted from SecureStore");
          },
        },
      ],
      { cancelable: false }
    );
  };

  return (
    <View className="flex-col pt-8">
      <View className="flex-row justify-center p-2">
        <Text className="text-btc100">Edit Friends: </Text>
        <Text className="text-btc100">
          Auth state: {authState?.authenticated ? "Logged in" : "Not logged in"}
        </Text>
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
