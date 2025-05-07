import {
  View,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
} from "react-native";
import React from "react";
import EditRemoveFcm from "./EditRemoveFcm";
import EditAddFriend from "./EditAddFriend";
import EditFriendRequests from "./EditFriendRequests";
import EditRemoveFriend from "./EditRemoveFriend";

const EditContainer = () => {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView>
          <View className="bg-btc500 h-full w-full p-8">
            <View className="flex-col gap-8">
              <EditAddFriend />
              <EditRemoveFriend />
              <EditFriendRequests />
              <EditRemoveFcm />
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default EditContainer;
