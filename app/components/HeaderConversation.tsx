import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

const HeaderSecondary = () => {
  const router = useRouter();

  const handleOnPress = () => {
    router.replace("/members");
  };

  return (
    <View className="flex-1 max-h-28 bg-btc500 border-b-2 border-b-btc100 justify-center">
      <TouchableOpacity onPress={handleOnPress}>
        <Text className="text-xl text-btc100 top-5 left-5">
          Header Secondary
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default HeaderSecondary;
