import { View, Text } from "react-native";

const Header = () => {
  return (
    <View className="flex-1 max-h-28 bg-btc500 border-b-2 border-b-btc100 justify-center">
      <Text className="text-xl text-btc100 top-5 left-5">Header</Text>
    </View>
  );
};

export default Header;
