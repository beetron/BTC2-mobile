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
import SettingsEmail from "./SettingsEmail";
import SettingsDeleteAccount from "./SettingsDeleteAccount";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import Border from "./Border";
import LegalNotices from "./LegalNotices";

const SettingsContainer = () => {
  return (
    <KeyboardAwareScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{
        flexGrow: 1,
        paddingBottom: 24,
      }}
      bottomOffset={100}
      extraKeyboardSpace={20}
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
          <Border />
          <SettingsPassword />
          <Border />
          <SettingsEmail />
          <Border />
          <SettingsIcon />
          <Border />
          <SettingsDeleteAccount />
          <LegalNotices />
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAwareScrollView>
  );
};

export default SettingsContainer;
