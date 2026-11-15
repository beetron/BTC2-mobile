import {
  setAlternateAppIcon,
  resetAppIcon,
  getAppIconName,
  type AlternateAppIcons,
} from "expo-alternate-app-icons";
import {
  Alert,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  type ImageSourcePropType,
} from "react-native";
import { Image } from "expo-image";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React, { useCallback, useState } from "react";
import StackHeader from "../../components/StackHeader";
import { icons } from "../../constants/icons";
import { images } from "../../constants/images";
import { useThemeColors } from "../../context/ThemeContext";
import { useTranslation } from "../../hooks/useTranslation";
import { useTypeScale } from "../../hooks/useTypeScale";

// iOS home-screen icon corner radius, as a fraction of the icon size
const ICON_RADIUS = 0.2237;
const COLUMNS = 3;
const H_PADDING = 16;
const GAP = 12;

interface IconOption {
  // null = the app's default icon (getAppIconName() reports it as null)
  name: AlternateAppIcons | null;
  source: ImageSourcePropType;
  labelKey: string;
}

const OPTIONS: IconOption[] = [
  { name: null, source: images.appMark, labelKey: "settings.changeIcon.names.default" },
  ...icons.map(([name, source]) => ({
    name: name as AlternateAppIcons,
    source,
    labelKey: `settings.changeIcon.names.${name}`,
  })),
];

const AppIconImage = ({ source, size }: { source: ImageSourcePropType; size: number }) => (
  <Image
    source={source}
    style={{
      width: size,
      height: size,
      borderRadius: size * ICON_RADIUS,
      backgroundColor: "#FFFFFF",
    }}
    contentFit="cover"
  />
);

const SettingsChangeIcon = () => {
  const { t } = useTranslation();
  const ts = useTypeScale();
  const colors = useThemeColors();
  const { width } = useWindowDimensions();
  const [currentIconName, setCurrentIconName] = useState<string | null>(getAppIconName());
  const [isSwitching, setIsSwitching] = useState(false);

  const tileWidth = Math.floor((width - H_PADDING * 2 - GAP * (COLUMNS - 1)) / COLUMNS);
  const current = OPTIONS.find((o) => o.name === currentIconName) ?? OPTIONS[0];

  const handleSelect = useCallback(
    async (option: IconOption) => {
      if (isSwitching || option.name === currentIconName) return;
      setIsSwitching(true);
      try {
        if (option.name === null) {
          await resetAppIcon();
          setCurrentIconName(null);
        } else {
          const newName = await setAlternateAppIcon(option.name);
          setCurrentIconName(newName);
        }
      } catch (error) {
        if (error instanceof Error) Alert.alert(t("common.error"), error.message);
      } finally {
        setIsSwitching(false);
      }
    },
    [currentIconName, isSwitching, t]
  );

  return (
    <View className="flex-1 bg-bg">
      <StackHeader title={t("settings.changeIcon.rowLabel")} />
      <ScrollView contentContainerStyle={{ padding: H_PADDING, paddingBottom: 40 }}>
        {/* Preview of the icon as it sits on the home screen */}
        <View
          className="items-center rounded-[28px] px-6 py-8 mb-7 gap-4"
          style={{ backgroundColor: colors.primarySoft }}
        >
          <View
            style={{
              shadowColor: "#000",
              shadowOpacity: 0.18,
              shadowRadius: 16,
              shadowOffset: { width: 0, height: 8 },
              elevation: 6,
            }}
          >
            <AppIconImage source={current.source} size={104} />
          </View>
          <View className="items-center gap-1">
            <Text className={`${ts.title} text-ink text-center`}>{t(current.labelKey)}</Text>
            <Text className={`${ts.label} text-inkMuted text-center`}>
              {t("settings.changeIcon.subtitle")}
            </Text>
          </View>
        </View>

        <Text className={`${ts.sectionHeader} text-inkMuted mx-1 mb-3`}>
          {t("settings.changeIcon.chooseLabel")}
        </Text>
        <View
          accessibilityRole="radiogroup"
          style={{ flexDirection: "row", flexWrap: "wrap", gap: GAP }}
        >
          {OPTIONS.map((option) => {
            const selected = option.name === currentIconName;
            const label = t(option.labelKey);
            return (
              <TouchableOpacity
                key={option.name ?? "default"}
                onPress={() => handleSelect(option)}
                disabled={isSwitching}
                activeOpacity={0.75}
                accessibilityRole="radio"
                accessibilityState={{ checked: selected, disabled: isSwitching }}
                accessibilityLabel={label}
                style={{
                  width: tileWidth,
                  alignItems: "center",
                  gap: 10,
                  paddingTop: 16,
                  paddingBottom: 12,
                  paddingHorizontal: 8,
                  borderRadius: 20,
                  backgroundColor: colors.surface,
                  borderWidth: selected ? 2 : 1,
                  borderColor: selected ? colors.primary : colors.border,
                  // Keep the content from shifting when the border thickens
                  margin: selected ? -1 : 0,
                }}
              >
                <AppIconImage source={option.source} size={Math.min(64, tileWidth - 36)} />
                <Text
                  className={selected ? ts.bodyStrong : ts.label}
                  style={{ color: selected ? colors.primary : colors.ink, textAlign: "center" }}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.8}
                >
                  {label}
                </Text>
                {selected ? (
                  <View
                    style={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      width: 22,
                      height: 22,
                      borderRadius: 11,
                      backgroundColor: colors.primary,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <MaterialCommunityIcons name="check" size={14} color={colors.onPrimary} />
                  </View>
                ) : null}
              </TouchableOpacity>
            );
          })}
        </View>

        <Text className={`${ts.caption} text-inkMuted text-center mt-6 mx-4`}>
          {t("settings.changeIcon.systemNote")}
        </Text>
      </ScrollView>
    </View>
  );
};

export default SettingsChangeIcon;
