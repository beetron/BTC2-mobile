import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { View } from "react-native";
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
    <View>
      <MaterialCommunityIcons
        name="chevron-left"
        size={36}
        color={colors.btc100}
        onPress={handleOnPress}
      />
    </View>
  );
};

export default HeaderBackButton;
