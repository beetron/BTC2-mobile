import { AlternateAppIcons } from "expo-alternate-app-icons";
import { Image, TouchableOpacity, type ImageRequireSource } from "react-native";

interface IconButtonProps {
  source: ImageRequireSource;
  name: AlternateAppIcons;
  onPress: (name: AlternateAppIcons) => void;
  selected: boolean;
}

const IconButton = ({ source, name, onPress, selected }: IconButtonProps) => {
  return (
    <TouchableOpacity
      className={`p-2 rounded-xl ${selected ? "bg-btc100" : ""}`}
      onPress={() => onPress(name)}
    >
      <Image
        source={source}
        className="w-16 h-16 rounded-xl"
        resizeMode="contain"
      />
    </TouchableOpacity>
  );
};

export default IconButton;
