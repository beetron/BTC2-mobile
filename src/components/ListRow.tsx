import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useThemeColors } from "../context/ThemeContext";
import { useTypeScale } from "../hooks/useTypeScale";

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>["name"];

interface ListRowProps {
  label: string;
  icon?: IconName;
  value?: string;
  // Extra element before the chevron (e.g. a Badge)
  accessory?: React.ReactNode;
  onPress?: () => void;
  destructive?: boolean;
  // Defaults to true when onPress is set
  showChevron?: boolean;
  // Injected by ListSection
  isFirst?: boolean;
}

// One row of a ListSection. Layout is built to survive long Japanese
// labels: the label flexes and wraps (max 2 lines), the value truncates and
// is capped at ~45% width, and icon/chevron are fixed -- nothing gets pushed
// off-screen. Height is a minimum, never fixed, so taller glyphs grow it.
const ListRow = ({
  label,
  icon,
  value,
  accessory,
  onPress,
  destructive,
  showChevron,
  isFirst,
}: ListRowProps) => {
  const colors = useThemeColors();
  const ts = useTypeScale();
  const chevron = showChevron ?? !!onPress;
  const tint = destructive ? colors.danger : colors.primary;

  const content = (
    <View
      className={`flex-row items-center px-4 py-3 gap-3 ${isFirst ? "" : "border-t border-divider"}`}
      style={{ minHeight: 52 }}
    >
      {icon ? (
        <View
          className="items-center justify-center rounded-[10px]"
          style={{
            width: 34,
            height: 34,
            backgroundColor: destructive ? colors.dangerSoft : colors.primarySoft,
          }}
        >
          <MaterialCommunityIcons name={icon} size={19} color={tint} />
        </View>
      ) : null}
      <Text
        className={`${ts.body} flex-1 flex-shrink ${destructive ? "text-danger" : "text-ink"}`}
        numberOfLines={2}
      >
        {label}
      </Text>
      {value ? (
        <Text
          className={`${ts.body} text-inkMuted flex-shrink text-right`}
          style={{ maxWidth: "45%" }}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {value}
        </Text>
      ) : null}
      {accessory}
      {chevron ? (
        <MaterialCommunityIcons name="chevron-right" size={20} color={colors.inkSubtle} />
      ) : null}
    </View>
  );

  if (!onPress) return content;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.6}
      accessibilityRole="button"
      accessibilityLabel={value ? `${label}, ${value}` : label}
    >
      {content}
    </TouchableOpacity>
  );
};

export default ListRow;
