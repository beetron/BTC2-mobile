import { View, ScrollView } from "react-native";
import React from "react";
import SettingsProfileImage from "./SettingsProfileImage";
import SettingsNicknameRow from "./SettingsNicknameRow";
import SettingsUniqueIdRow from "./SettingsUniqueIdRow";
import SettingsPasswordRow from "./SettingsPasswordRow";
import SettingsIcon from "./SettingsIcon";
import SettingsLanguage from "./SettingsLanguage";
import SettingsUsername from "./SettingsUsername";
import SettingsEmailRow from "./SettingsEmailRow";
import SettingsDeleteAccount from "./SettingsDeleteAccount";
import LegalNotices from "./LegalNotices";
import SettingsVersion from "./SettingsVersion";
import SettingsSection from "./SettingsSection";
import { useTranslation } from "../hooks/useTranslation";

const SettingsContainer = () => {
  const { t } = useTranslation();

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }}
    >
      <View className="flex bg-btc500 h-full w-full p-6">
        <View className="flex-row items-center mb-6">
          <SettingsProfileImage />
          <View className="ml-4 flex-1">
            <SettingsUsername />
          </View>
        </View>

        <SettingsSection title={t("settings.sections.account")}>
          <SettingsNicknameRow />
          <SettingsUniqueIdRow />
          <SettingsPasswordRow />
          <SettingsEmailRow />
        </SettingsSection>

        <SettingsSection title={t("settings.sections.preferences")}>
          <SettingsIcon />
          <SettingsLanguage />
        </SettingsSection>

        <SettingsSection title={t("settings.sections.legal")}>
          <LegalNotices />
        </SettingsSection>

        <SettingsSection title={t("settings.sections.version")}>
          <SettingsVersion />
        </SettingsSection>

        <SettingsSection title={t("settings.sections.dangerZone")} variant="danger">
          <SettingsDeleteAccount />
        </SettingsSection>
      </View>
    </ScrollView>
  );
};

export default SettingsContainer;
