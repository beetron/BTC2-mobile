import Entypo from "@expo/vector-icons/Entypo";
import { View } from "react-native";
import { useRouter } from "expo-router";

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
      <Entypo name="back" size={36} color="white" onPress={handleOnPress} />
    </View>
  );
};

export default HeaderBackButton;
