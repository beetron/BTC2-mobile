import React from "react";
import { Text, TouchableOpacity } from "react-native";
import { useThemeColors } from "../context/ThemeContext";
import { useTypeScale } from "../hooks/useTypeScale";

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
}

// Filter chip. Width hugs the label -- chips live in a horizontal ScrollView
// so a longer Japanese label scrolls instead of overflowing the row.
const Chip = ({ label, selected, onPress }: ChipProps) => {
  const colors = useThemeColors();
  const ts = useTypeScale();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      style={{
        minHeight: 36,
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 18,
        justifyContent: "center",
        backgroundColor: selected ? colors.ink : colors.surface,
        borderWidth: selected ? 0 : 1,
        borderColor: colors.border,
      }}
    >
      <Text
        className={selected ? ts.bodyStrong : ts.body}
        style={{ color: selected ? colors.bg : colors.ink }}
        numberOfLines={1}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

export default Chip;
