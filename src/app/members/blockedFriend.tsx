import { View, Text, ActivityIndicator, ScrollView, TouchableOpacity } from "react-native";
import { useState, useEffect } from "react";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import useGetBlockedFriends from "@/src/hooks/useGetBlockedFriends";
import useUnblockUser from "@/src/hooks/useUnblockUser";
import StackHeader from "../../components/StackHeader";
import Avatar from "../../components/Avatar";
import { useTypeScale } from "../../hooks/useTypeScale";
import { useTranslation } from "../../hooks/useTranslation";
import { useThemeColors } from "../../context/ThemeContext";

interface Friend {
  _id: string;
  uniqueId: string;
  nickname: string;
  profileImage: string;
  profileImageData?: string;
}

const BlockedFriend = () => {
  const colors = useThemeColors();
  const [shouldRender, setShouldRender] = useState(false);
  const { blockedFriends, getBlockedFriends, isLoading } =
    useGetBlockedFriends();

  useEffect(() => {
    getBlockedFriends();
  }, [shouldRender]);

  const { unblockUser } = useUnblockUser();
  const { t } = useTranslation();
  const ts = useTypeScale();

  const handleOnPress = async (friendId: string) => {
    try {
      const success = await unblockUser(friendId);
      if (success) {
        setShouldRender((prev) => !prev);
      }
    } catch (error) {
      console.error("Error unblocking user: ", error);
    }
  };

  return (
    <View className="flex-1 bg-bg">
      <StackHeader title={t("friends.blockedRow")} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        <View className="flex-row items-start gap-2.5 p-3.5 mb-4 rounded-2xl bg-surfaceMuted">
          <MaterialCommunityIcons name="information-outline" size={20} color={colors.inkMuted} />
          <Text className={`${ts.label} text-inkMuted flex-1`}>
            {t("friends.blockedScreen.notice")}
          </Text>
        </View>

        {isLoading && (!blockedFriends || blockedFriends.length === 0) ? (
          <View className="mt-6 items-center">
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : !blockedFriends || blockedFriends.length === 0 ? (
          <Text className={`${ts.body} text-inkMuted text-center mt-8`}>
            {t("friends.blockedScreen.empty")}
          </Text>
        ) : (
          <View className="bg-surface border border-border rounded-[20px] overflow-hidden">
            {blockedFriends.map((friend: Friend, index: number) => (
              <View
                key={friend._id}
                className={`flex-row items-center px-4 py-2.5 gap-3 ${
                  index > 0 ? "border-t border-divider" : ""
                }`}
                style={{ minHeight: 64 }}
              >
                <Avatar uri={friend.profileImageData} size={44} />
                <Text className={`${ts.bodyStrong} text-ink flex-1`} numberOfLines={1}>
                  {friend.nickname}
                </Text>
                <TouchableOpacity
                  onPress={() => handleOnPress(friend._id)}
                  accessibilityRole="button"
                  accessibilityLabel={t("friends.blockedScreen.unblockA11y", {
                    name: friend.nickname,
                  })}
                  style={{
                    minHeight: 36,
                    maxWidth: 140,
                    paddingHorizontal: 14,
                    borderRadius: 18,
                    justifyContent: "center",
                    backgroundColor: colors.primarySoft,
                  }}
                >
                  <Text
                    className={ts.label}
                    style={{ color: colors.primary }}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.8}
                  >
                    {t("friends.blockedScreen.unblock")}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default BlockedFriend;
