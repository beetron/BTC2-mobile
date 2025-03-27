import { View, Text } from "react-native";
import React, { useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import { useAuth } from "@/context/AuthContext";

const EditFriends = () => {
  // const deleteFcmTokens = async () => {
  //   await SecureStore.deleteItemAsync("fcm_token");
  //   await SecureStore.deleteItemAsync("fcm_token_timestamp");
  //   console.log("FCM tokens deleted from SecureStore");
  // };

  // useEffect(() => {
  //   deleteFcmTokens();
  // }, []);

  const { authState } = useAuth();

  return (
    <View className="flex-1">
      <Text>Edit Friends</Text>
      <Text>
        Auth state: {authState?.authenticated ? "Logged in" : "Not logged in"}
      </Text>
    </View>
  );
};

export default EditFriends;
