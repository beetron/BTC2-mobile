import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useTranslation } from "../hooks/useTranslation";

const EditBlockedFriend = () => {
  const router = useRouter();
  const { t } = useTranslation();
  return (
    <View className="bg-btc500 mt-4 mb-4 flex-1">
      <View>
        <TouchableOpacity onPress={() => router.push("../blockedFriend")}>
          <Text className="text-btc100 font-funnel-regular text-2xl items-start">
            {t("friends.blockedRow")}
          </Text>
          <AntDesign
            name="arrow-right"
            size={28}
            color="white"
            className="absolute right-0"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default EditBlockedFriend;
