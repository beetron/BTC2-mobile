import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

const ConversationHeader = () => {
  const router = useRouter();

  const handleOnPress = () => {
    router.back();
  };

  return (
    <View className="flex-1 max-h-28 justify-center border-b-hairline border-btc100 bg-[#1f1f2e]">
      <TouchableOpacity onPress={handleOnPress}>
        <Text className="text-2xl text-btc100 top-5 left-5 font-funnel-medium">
          Back
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default ConversationHeader;
