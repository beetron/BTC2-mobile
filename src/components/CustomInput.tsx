import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { useState } from "react";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useThemeColors } from "../context/ThemeContext";
import { useTypeScale } from "../hooks/useTypeScale";
import { useTranslation } from "../hooks/useTranslation";

interface CustomInputProps {
  // Visible label; pass "" when the screen header already names the field
  title: string;
  placeholder?: string;
  placeholderColor?: string;
  value: string;
  containerStyles?: string;
  textStyles?: string;
  isPassword?: boolean;
  // Small helper/counter line under the field
  helperText?: string;
  onChangeText: (text: string) => void;
  [key: string]: any;
}

const CustomInput: React.FC<CustomInputProps> = ({
  title,
  placeholder,
  placeholderColor,
  value,
  containerStyles = "",
  textStyles = "",
  isPassword,
  helperText,
  onChangeText,
  onFocus,
  onBlur,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(false);
  const colors = useThemeColors();
  const ts = useTypeScale();
  const { t } = useTranslation();

  return (
    <View className={`gap-2 ${containerStyles}`}>
      {title ? <Text className={`${ts.label} text-ink`}>{title}</Text> : null}
      {/* minHeight, not height -- Noto Sans JP's taller line box must not clip */}
      <View
        className="w-full flex-row items-center rounded-2xl pl-4 pr-1.5"
        style={{
          minHeight: 52,
          backgroundColor: colors.surface,
          borderWidth: focused ? 1.5 : 1,
          borderColor: focused ? colors.primary : colors.border,
        }}
      >
        <TextInput
          className={`flex-1 ${ts.body} ${textStyles}`}
          style={{ color: colors.ink, paddingVertical: 12, fontSize: 16 }}
          placeholder={placeholder}
          placeholderTextColor={placeholderColor ?? colors.inkSubtle}
          value={value}
          secureTextEntry={isPassword && !showPassword}
          onChangeText={onChangeText}
          accessibilityLabel={title || placeholder}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          {...props}
        />

        {isPassword && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            accessibilityRole="button"
            accessibilityLabel={
              showPassword ? t("common.hidePassword") : t("common.showPassword")
            }
            style={{ width: 44, height: 44, alignItems: "center", justifyContent: "center" }}
          >
            <MaterialCommunityIcons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={22}
              color={colors.inkMuted}
            />
          </TouchableOpacity>
        )}
      </View>
      {helperText ? (
        <Text className={`${ts.caption} text-inkMuted text-right`}>{helperText}</Text>
      ) : null}
    </View>
  );
};

export default CustomInput;
