import {
  View,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import React from "react";
import SettingsProfileImage from "./SettingsProfileImage";
import SettingsNickname from "./SettingsNickname";
import SettingsUniqueId from "./SettingsUniqueId";
import SettingsPassword from "./SettingsPassword";

const SettingsContainer = () => {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex bg-btc500 h-full w-full p-8">
          <View className="flex-row">
            <SettingsProfileImage />
            <View className="flex-col justify-center w-[90%]">
              <SettingsNickname />
              <SettingsUniqueId />
            </View>
          </View>
          <View>
            <SettingsPassword />
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default SettingsContainer;
