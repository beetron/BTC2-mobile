import { View, ScrollView, Text, Alert } from "react-native";
import React from "react";
import { useRouter } from "expo-router";
import ScreenHeader from "./ScreenHeader";
import ListSection from "./ListSection";
import ListRow from "./ListRow";
import SegmentedControl from "./SegmentedControl";
import SettingsProfileImage from "./SettingsProfileImage";
import SettingsDeleteAccount from "./SettingsDeleteAccount";
import CustomButton from "./CustomButton";
import { useAuth } from "../context/AuthContext";
import { useTheme, ThemePreference } from "../context/ThemeContext";
import { useTranslation } from "../hooks/useTranslation";
import { useTypeScale } from "../hooks/useTypeScale";

const PRIVACY_POLICY_URL = "https://beetron.github.io/BTC2-mobile/#privacy-policy";
const EULA_URL = "https://beetron.github.io/BTC2-mobile/eula.html";

const SettingsContainer = () => {
  const { t, locale } = useTranslation();
  const ts = useTypeScale();
  const router = useRouter();
  const { authState, onLogout } = useAuth();
  const { preference, setPreference } = useTheme();
  const user = authState?.user;
  const appVersion = process.env.EXPO_PUBLIC_APP_VERSION;

  const openLegal = (url: string, titleKey: string) =>
    router.push({ pathname: "../legalDocument", params: { url, titleKey } });

  // Moved here from the old Logout tab -- same confirm-then-logout flow.
  const handleLogout = () => {
    Alert.alert(
      t("tabs.logoutConfirmTitle"),
      "",
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("tabs.logout"),
          style: "destructive",
          onPress: async () => {
            try {
              if (onLogout) await onLogout();
            } catch (e) {
              console.log(e);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const themeOptions: { value: ThemePreference; label: string; icon: any }[] = [
    { value: "light", label: t("settings.appearance.light"), icon: "white-balance-sunny" },
    { value: "dark", label: t("settings.appearance.dark"), icon: "weather-night" },
    { value: "system", label: t("settings.appearance.system"), icon: "cellphone" },
  ];

  return (
    <View className="flex-1">
      <ScreenHeader title={t("tabs.settings")} />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40, paddingTop: 4 }}
      >
        {/* Profile card */}
        <View
          className="flex-row items-center gap-4 p-4 mb-6 rounded-[22px] bg-surface border border-border"
          style={{ minHeight: 96 }}
        >
          <SettingsProfileImage />
          <View className="flex-1 min-w-0 gap-0.5">
            <Text className={`${ts.title} text-ink`} numberOfLines={1}>
              {user?.nickname || user?.username}
            </Text>
            <Text className={`${ts.label} text-inkMuted`} numberOfLines={1}>
              @{user?.username}
            </Text>
            {user?.uniqueId ? (
              <Text className={`${ts.label} text-inkMuted`} numberOfLines={1}>
                {t("friends.hub.idPrefix", { id: user.uniqueId })}
              </Text>
            ) : null}
          </View>
        </View>

        {/* Appearance */}
        <View className="mb-6">
          <Text className={`${ts.sectionHeader} text-inkMuted mx-1 mb-2`}>
            {t("settings.appearance.title")}
          </Text>
          <SegmentedControl
            options={themeOptions}
            value={preference}
            onChange={setPreference}
            accessibilityLabel={t("settings.appearance.title")}
          />
        </View>

        <ListSection title={t("settings.sections.account")}>
          <ListRow
            icon="account-outline"
            label={t("settings.nickname.label")}
            value={user?.nickname}
            onPress={() => router.push("../settingsNickname")}
          />
          <ListRow
            icon="identifier"
            label={t("settings.uniqueId.rowLabel")}
            value={user?.uniqueId}
            onPress={() => router.push("../settingsUniqueId")}
          />
          <ListRow
            icon="email-outline"
            label={t("settings.email.rowLabel")}
            value={user?.email}
            onPress={() => router.push("../settingsEmail")}
          />
          <ListRow
            icon="lock-outline"
            label={t("settings.password.title")}
            onPress={() => router.push("../settingsPassword")}
          />
        </ListSection>

        <ListSection title={t("settings.sections.preferences")}>
          <ListRow
            icon="translate"
            label={t("settings.languageRow")}
            value={
              locale === "ja"
                ? t("settings.language.japanese")
                : t("settings.language.english")
            }
            onPress={() => router.push("../settingsLanguage")}
          />
          <ListRow
            icon="apps"
            label={t("settings.changeIcon.rowLabel")}
            onPress={() => router.push("../settingsChangeIcon")}
          />
        </ListSection>

        <ListSection title={t("settings.sections.about")}>
          <ListRow
            icon="shield-check-outline"
            label={t("settings.legal.privacyPolicy")}
            onPress={() => openLegal(PRIVACY_POLICY_URL, "settings.legal.privacyPolicy")}
          />
          <ListRow
            icon="file-document-outline"
            label={t("settings.legal.eula")}
            onPress={() => openLegal(EULA_URL, "settings.legal.eula")}
          />
          <ListRow
            icon="information-outline"
            label={t("settings.sections.version")}
            value={appVersion}
          />
        </ListSection>

        <CustomButton
          title={t("tabs.logout")}
          handlePress={handleLogout}
          variant="dangerSoft"
        />
        <View className="mt-3">
          <SettingsDeleteAccount />
        </View>
      </ScrollView>
    </View>
  );
};

export default SettingsContainer;
