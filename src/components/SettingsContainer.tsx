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
import SettingsIcon from "./SettingsIcon";
import SettingsUsername from "./SettingsUsername";

const SettingsContainer = () => {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex bg-btc500 h-full w-full p-8">
          <View className="flex-row mb-4">
            <SettingsProfileImage />
            <View className="flex-col justify-center w-[90%]">
              <SettingsUsername />
              <SettingsNickname />
              <SettingsUniqueId />
            </View>
          </View>
          <View
            style={{
              height: 1,
              backgroundColor: "grey",
            }}
          />
          <SettingsPassword />
          <View
            style={{
              height: 1,
              backgroundColor: "grey",
            }}
          />
          <SettingsIcon />
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default SettingsContainer;
