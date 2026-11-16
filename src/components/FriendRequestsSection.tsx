import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import useGetFriendRequests from "@/src/hooks/useGetFriendRequests";
import useAcceptFriend from "@/src/hooks/useAcceptFriend";
import useRejectFriend from "@/src/hooks/useRejectFriend";
import { useAppStateListener } from "@/src/context/AppStateContext";
import { useThemeColors } from "../context/ThemeContext";
import { useTranslation } from "../hooks/useTranslation";
import { useTypeScale } from "../hooks/useTypeScale";
import ListSection from "./ListSection";
import Avatar from "./Avatar";
import Badge from "./Badge";
import IconCircleButton from "./IconCircleButton";

interface Friend {
  _id: string;
  uniqueId: string;
  nickname: string;
  profileImage: string;
  profileImageData?: string;
}

// Pending requests, accepted/declined inline on the Friends tab (replaces
// the separate friendRequests screen). useGetFriendRequests also keeps the
// tab badge count in friendRequestsStore up to date on every fetch.
const FriendRequestsSection = () => {
  const colors = useThemeColors();
  const ts = useTypeScale();
  const { t } = useTranslation();
  const { getFriendRequests, isLoading, friendRequests } = useGetFriendRequests();
  const { acceptFriend } = useAcceptFriend();
  const { rejectFriend } = useRejectFriend();
  // uniqueId of the row with a request in flight -- disables just that row
  const [busyId, setBusyId] = useState<string | null>(null);

  useAppStateListener(() => {
    getFriendRequests();
  });

  useFocusEffect(
    useCallback(() => {
      getFriendRequests();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  const respond = async (uniqueId: string, accept: boolean) => {
    setBusyId(uniqueId);
    const success = accept ? await acceptFriend(uniqueId) : await rejectFriend(uniqueId);
    setBusyId(null);
    if (success) getFriendRequests();
  };

  const requests: Friend[] = friendRequests ?? [];
  // Only the very first load shows a spinner; refreshes keep rows on screen.
  const showSpinner = isLoading && requests.length === 0;

  return (
    <ListSection
      title={t("friends.hub.requestsTitle")}
      titleAccessory={<Badge count={requests.length} small />}
    >
      {showSpinner ? (
        <View className="py-5 items-center">
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : requests.length === 0 ? (
        <Text className={`${ts.body} text-inkMuted px-4 py-4`}>
          {t("friends.requests.empty")}
        </Text>
      ) : (
        <View>
          {requests.map((friend, index) => {
            const busy = busyId === friend.uniqueId;
            return (
              <View
                key={friend._id}
                className={`flex-row items-center px-4 py-3 gap-3 ${
                  index > 0 ? "border-t border-divider" : ""
                }`}
                style={{ minHeight: 64, opacity: busy ? 0.5 : 1 }}
              >
                <Avatar uri={friend.profileImageData} size={44} />
                <View className="flex-1 min-w-0">
                  <Text className={`${ts.bodyStrong} text-ink`} numberOfLines={1}>
                    {friend.nickname}
                  </Text>
                  <Text className={`${ts.label} text-inkMuted`} numberOfLines={1}>
                    {t("friends.hub.idPrefix", { id: friend.uniqueId })}
                  </Text>
                </View>
                <IconCircleButton
                  icon="close"
                  size={40}
                  iconSize={18}
                  accessibilityLabel={t("friends.requests.decline", {
                    name: friend.nickname,
                  })}
                  disabled={busy}
                  onPress={() => respond(friend.uniqueId, false)}
                />
                <TouchableOpacity
                  onPress={() => respond(friend.uniqueId, true)}
                  disabled={busy}
                  accessibilityRole="button"
                  accessibilityLabel={t("friends.requests.acceptA11y", {
                    name: friend.nickname,
                  })}
                  style={{
                    minHeight: 40,
                    maxWidth: 120,
                    paddingHorizontal: 16,
                    borderRadius: 20,
                    justifyContent: "center",
                    backgroundColor: colors.primary,
                  }}
                >
                  <Text
                    className={ts.bodyStrong}
                    style={{ color: colors.onPrimary }}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.8}
                  >
                    {t("friends.requests.accept")}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      )}
    </ListSection>
  );
};

export default FriendRequestsSection;
