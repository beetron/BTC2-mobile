import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import React from "react";
import SettingsProfileImage from "./SettingsProfileImage";
import SettingsNickname from "./SettingsNickname";

const SettingsContainer = () => {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex bg-btc500 h-full w-full p-4">
          <View className="flex-row">
            <SettingsProfileImage />
            <SettingsNickname />
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default SettingsContainer;
