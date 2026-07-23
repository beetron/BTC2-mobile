import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { colors } from "../constants/colors";

interface HeaderBackButtonProps {
  routerOption: string;
}

const HeaderBackButton = ({ routerOption }: HeaderBackButtonProps) => {
  const router = useRouter();

  const handleOnPress = () => {
    if (routerOption === "back") {
      router.back();
    }
    if (routerOption === "replaceHome") {
      router.replace("/members");
    }
  };
  return (
    <TouchableOpacity
      onPress={handleOnPress}
      hitSlop={{ top: 12, bottom: 12, left: 12, right: 28 }}
    >
      <MaterialCommunityIcons
        name="chevron-left"
        size={40}
        color={colors.btc100}
      />
    </TouchableOpacity>
  );
};

export default HeaderBackButton;
