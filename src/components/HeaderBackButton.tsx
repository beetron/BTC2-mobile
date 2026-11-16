import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useThemeColors } from "../context/ThemeContext";
import { useTranslation } from "../hooks/useTranslation";

interface HeaderBackButtonProps {
  routerOption: "back" | "home";
}

const HeaderBackButton = ({ routerOption }: HeaderBackButtonProps) => {
  const router = useRouter();
  const colors = useThemeColors();
  const { t } = useTranslation();

  const handleOnPress = () => {
    if (routerOption === "back") {
      router.back();
    }
    // dismissTo, not replace -- replace("/members") swapped the current screen
    // for a *brand-new* members/(tabs) route instead of returning to the one
    // already underneath it, leaving a live copy of the whole tab navigator in
    // the stack per back tap. dismissTo pops back to the existing entry, and
    // falls back to replace behaviour if (tabs) isn't in the stack at all
    // (e.g. opened straight into a chat from a push notification).
    //
    // Safe now that the list screens refresh via useFocusEffect -- the forced
    // remount replace() gave us was only ever a workaround for the plain
    // useEffect they used to fetch with.
    if (routerOption === "home") {
      router.dismissTo("/members");
    }
  };
  return (
    <TouchableOpacity
      onPress={handleOnPress}
      hitSlop={{ top: 6, bottom: 6, left: 6, right: 12 }}
      accessibilityRole="button"
      accessibilityLabel={t("common.back")}
      style={{ width: 44, height: 44, alignItems: "center", justifyContent: "center" }}
    >
      <MaterialCommunityIcons name="chevron-left" size={32} color={colors.ink} />
    </TouchableOpacity>
  );
};

export default HeaderBackButton;
