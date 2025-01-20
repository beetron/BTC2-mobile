import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { useState } from "react";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";

interface CustomInputProps {
  title: string;
  placeholder?: string;
  placeholderColor?: string;
  value: string;
  containerStyles?: string;
  textStyles?: string;
  isPassword?: boolean;
  onChangeText: (text: string) => void;
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
  return (
    <View className={`space-y-2 ${containerStyles}`}>
      <Text className="text-xl text-btc100 font-funnel-semi-bold my-2">
        {title}
      </Text>
      <View
        className="w-full h-14 px-4 bg-btc100 rounded-2xl border=2
       border-btc200 flex flex-row items-center"
      >
        <TextInput
          className={`flex-1 text-black text-2xl justify-center font-normal ${textStyles}`}
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
              <FontAwesome5 name="eye" size={24} color="black" />
            ) : (
              <FontAwesome5 name="eye-slash" size={24} color="black" />
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default CustomInput;
