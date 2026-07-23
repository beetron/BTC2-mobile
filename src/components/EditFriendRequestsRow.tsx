import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslation } from "../hooks/useTranslation";
import { colors } from "../constants/colors";
import friendRequestsStore from "../zustand/friendRequestsStore";

const EditFriendRequestsRow = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const { pendingCount } = friendRequestsStore();
  return (
    <TouchableOpacity onPress={() => router.push("../friendRequests")}>
      <View className="flex-row justify-between items-center px-4 py-3 border-t border-btc500">
        <View className="flex-row items-center gap-3">
          <MaterialCommunityIcons
            name="account-clock-outline"
            size={20}
            color={colors.accent}
          />
          <Text className="text-btc100 font-funnel-regular text-lg">
            {t("friends.requests.title")}
          </Text>
          {pendingCount > 0 && (
            <View className="bg-danger rounded-full min-w-[20px] h-5 px-1.5 items-center justify-center">
              <Text className="text-btc100 text-xs font-funnel-semi-bold">
                {pendingCount > 99 ? "99+" : pendingCount}
              </Text>
            </View>
          )}
        </View>
        <MaterialCommunityIcons
          name="chevron-right"
          size={22}
          color={colors.btc200}
        />
      </View>
    </TouchableOpacity>
  );
};

export default EditFriendRequestsRow;
