import { AlternateAppIcons } from "expo-alternate-app-icons";
import { View, Image, TouchableOpacity, type ImageRequireSource } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { colors } from "../constants/colors";

interface IconButtonProps {
  source: ImageRequireSource;
  name: AlternateAppIcons;
  onPress: (name: AlternateAppIcons) => void;
  selected: boolean;
}

const IconButton = ({ source, name, onPress, selected }: IconButtonProps) => {
  return (
    <TouchableOpacity activeOpacity={0.7} onPress={() => onPress(name)}>
      <View
        className="p-1 rounded-2xl border-2"
        style={{ borderColor: selected ? colors.accent : "transparent" }}
      >
        <Image
          source={source}
          className="w-16 h-16 rounded-xl"
          resizeMode="contain"
        />
        {selected && (
          <View
            className="absolute -top-1.5 -right-1.5 rounded-full items-center justify-center"
            style={{ backgroundColor: colors.accent, width: 20, height: 20 }}
          >
            <MaterialCommunityIcons name="check" size={14} color={colors.btc100} />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default IconButton;
