import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslation } from "../hooks/useTranslation";
import { colors } from "../constants/colors";

const EditBlockedFriend = () => {
  const router = useRouter();
  const { t } = useTranslation();
  return (
    <TouchableOpacity onPress={() => router.push("../blockedFriend")}>
      <View className="flex-row justify-between items-center px-4 py-3 border-t border-btc500">
        <Text className="text-btc100 font-funnel-regular text-lg">
          {t("friends.blockedRow")}
        </Text>
        <MaterialCommunityIcons
          name="chevron-right"
          size={22}
          color={colors.btc200}
        />
      </View>
    </TouchableOpacity>
  );
};

export default EditBlockedFriend;
