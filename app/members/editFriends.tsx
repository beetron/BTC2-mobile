import { View, Text } from "react-native";
import React, { useEffect } from "react";
import * as SecureStore from "expo-secure-store";

const EditFriends = () => {
  // const deleteFcmTokens = async () => {
  //   await SecureStore.deleteItemAsync("fcm_token");
  //   await SecureStore.deleteItemAsync("fcm_token_timestamp");
  //   console.log("FCM tokens deleted from SecureStore");
  // };

  // useEffect(() => {
  //   deleteFcmTokens();
  // }, []);

  return (
    <View className="flex-1">
      <Text>Edit Friends</Text>
    </View>
  );
};

export default EditFriends;
