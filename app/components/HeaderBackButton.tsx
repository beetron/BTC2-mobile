import Entypo from "@expo/vector-icons/Entypo";
import { View } from "react-native";
import { useRouter } from "expo-router";

const HeaderBackButton = () => {
  const router = useRouter();

  const handleOnPress = () => {
    router.back();
  };
  return (
    <View className="flex-1 items-start justify-end mb-2 ml-4">
      <Entypo name="back" size={36} color="white" onPress={handleOnPress} />
    </View>
  );
};

export default HeaderBackButton;
