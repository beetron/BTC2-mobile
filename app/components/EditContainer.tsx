import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import React from "react";
import EditRemoveFcm from "./EditRemoveFcm";
import EditAddFriend from "./EditAddFriend";

const EditContainer = () => {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="bg-btc500 h-full w-full p-8">
          <View>
            <EditAddFriend />
            {/* <View className="w-full border-b border-btc100 p-2" /> */}
            <EditRemoveFcm />
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default EditContainer;
