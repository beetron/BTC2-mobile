import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import AntDesign from "@expo/vector-icons/AntDesign";

const EditRemoveFriend = () => {
  const router = useRouter();
  return (
    <View className="bg-btc500 mt-4 mb-4 flex-1">
      <View>
        <TouchableOpacity onPress={() => router.push("../removeFriend")}>
          <Text className="text-btc100 font-funnel-regular text-2xl items-start">
            Remove / Block Friend
          </Text>
          <AntDesign
            name="arrowright"
            size={28}
            color="white"
            className="absolute right-0"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default EditRemoveFriend;
