import React from "react";
import { Modal, View, Text, TouchableOpacity } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTheme } from "../context/ThemeContext";
import { useTypeScale } from "../hooks/useTypeScale";
import { useTranslation } from "../hooks/useTranslation";

export interface ActionSheetOption {
  label: string;
  icon: string;
  variant?: "default" | "danger";
  onPress: () => void;
}

interface ActionSheetProps {
  visible: boolean;
  onClose: () => void;
  options: ActionSheetOption[];
  title?: string;
}

const ActionSheet: React.FC<ActionSheetProps> = ({
  visible,
  onClose,
  options,
  title,
}) => {
  const { t } = useTranslation();
  const { colors, colorVarsStyle } = useTheme();
  const ts = useTypeScale();

  const handleSelect = (option: ActionSheetOption) => {
    onClose();
    option.onPress();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      {/* Re-apply the theme vars: Modal content renders in its own native
          window, so don't rely on the root View's vars reaching it. Stays
          centered + fade (a slide-in variant was tried and was buggy). */}
      <View style={[{ flex: 1 }, colorVarsStyle]}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={onClose}
          accessibilityLabel={t("common.cancel")}
          style={{
            flex: 1,
            backgroundColor: "rgba(8,20,26,0.45)",
            justifyContent: "center",
          }}
        >
          <TouchableOpacity activeOpacity={1} className="mx-6">
            <View className="bg-surface rounded-[22px] overflow-hidden">
              {title && (
                <View className="px-5 py-3.5 border-b border-divider">
                  <Text className={`${ts.label} text-inkMuted text-center`}>{title}</Text>
                </View>
              )}
              {options.map((option, index) => {
                const isDanger = option.variant === "danger";
                return (
                  <TouchableOpacity
                    key={option.label}
                    onPress={() => handleSelect(option)}
                    accessibilityRole="button"
                    className={`flex-row items-center gap-3.5 px-5 py-3.5 ${
                      index > 0 ? "border-t border-divider" : ""
                    }`}
                    style={{ minHeight: 54 }}
                  >
                    <MaterialCommunityIcons
                      name={option.icon as any}
                      size={22}
                      color={isDanger ? colors.danger : colors.ink}
                    />
                    <Text
                      className={`${isDanger ? ts.bodyStrong : ts.body} flex-1 flex-shrink`}
                      style={{ color: isDanger ? colors.danger : colors.ink }}
                      numberOfLines={2}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <TouchableOpacity
              onPress={onClose}
              accessibilityRole="button"
              className="bg-surface rounded-[22px] mt-2 items-center justify-center"
              style={{ minHeight: 54 }}
            >
              <Text className={`${ts.bodyStrong} text-ink`}>{t("common.cancel")}</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

export default ActionSheet;
