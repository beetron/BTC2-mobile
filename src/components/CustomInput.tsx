import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { useState } from "react";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useLocale } from "../context/LocaleContext";

interface CustomInputProps {
  title: string;
  placeholder?: string;
  placeholderColor?: string;
  value: string;
  containerStyles?: string;
  textStyles?: string;
  isPassword?: boolean;
  onChangeText: (text: string) => void;
  [key: string]: any;
}

const CustomInput: React.FC<CustomInputProps> = ({
  title,
  placeholder,
  placeholderColor,
  value,
  containerStyles,
  textStyles,
  isPassword,
  onChangeText,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  // Noto Sans JP renders visibly larger than Funnel Display at the same
  // nominal size, so Japanese uses one step down on both label and field text.
  const { locale } = useLocale();
  const labelSize = locale === "ja" ? "text-lg" : "text-xl";
  const fieldSize = locale === "ja" ? "text-xl" : "text-2xl";

  return (
    <View className={`space-y-2 ${containerStyles}`}>
      <Text className={`${labelSize} text-btc100 font-funnel-semi-bold my-2`}>
        {title}
      </Text>
      <View
        className="w-full h-14 px-4 bg-btc100 rounded-2xl border=2
       border-btc200 flex flex-row items-center"
      >
        <TextInput
          className={`flex-1 text-black ${fieldSize} justify-center font-normal ${textStyles}`}
          placeholder={placeholder}
          placeholderTextColor={placeholderColor}
          value={value}
          secureTextEntry={isPassword && !showPassword}
          onChangeText={onChangeText}
          {...props}
        />

        {isPassword && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            {showPassword ? (
              <MaterialCommunityIcons name="eye" size={24} color="black" />
            ) : (
              <MaterialCommunityIcons name="eye-off" size={24} color="black" />
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default CustomInput;
