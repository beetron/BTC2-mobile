import React from "react";
import { Modal, View, Text, TouchableOpacity } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { colors } from "../constants/colors";
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
}

const ActionSheet: React.FC<ActionSheetProps> = ({
  visible,
  onClose,
  options,
}) => {
  const { t } = useTranslation();

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
      <TouchableOpacity
        activeOpacity={1}
        onPress={onClose}
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
          justifyContent: "center",
        }}
      >
        <TouchableOpacity activeOpacity={1} className="mx-6">
          <View className="bg-card rounded-2xl overflow-hidden">
            {options.map((option, index) => {
              const isDanger = option.variant === "danger";
              return (
                <TouchableOpacity
                  key={option.label}
                  onPress={() => handleSelect(option)}
                  className={`flex-row items-center gap-3 px-4 py-4 ${
                    index > 0 ? "border-t border-btc500" : ""
                  }`}
                >
                  <MaterialCommunityIcons
                    name={option.icon as any}
                    size={22}
                    color={isDanger ? colors.danger : colors.accent}
                  />
                  <Text
                    className="font-funnel-regular text-lg"
                    style={{ color: isDanger ? colors.danger : colors.btc100 }}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <TouchableOpacity
            onPress={onClose}
            className="bg-card rounded-2xl mt-2 py-4 items-center"
          >
            <Text className="text-btc100 font-funnel-semi-bold text-lg">
              {t("common.cancel")}
            </Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

export default ActionSheet;
