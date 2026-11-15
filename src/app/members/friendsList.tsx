import { View, Text, ActivityIndicator, Alert, ScrollView, TouchableOpacity } from "react-native";
import React, { useRef, useState } from "react";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import SwipeRow, { SwipeRowHandle } from "../../components/SwipeRow";
import ActionSheet from "../../components/ActionSheet";
import useBlockUser from "@/src/hooks/useBlockUser";
import useGetMyFriends from "@/src/hooks/useGetMyFriends";
import useRemoveFriend from "@/src/hooks/useRemoveFriend";
import StackHeader from "../../components/StackHeader";
import Avatar from "../../components/Avatar";
import { useTranslation } from "../../hooks/useTranslation";
import { useTypeScale } from "../../hooks/useTypeScale";
import { useThemeColors } from "../../context/ThemeContext";

interface Friend {
  _id: string;
  uniqueId: string;
  nickname: string;
  profileImage: string;
  profileImageData?: string;
}

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>["name"];

const ACTION_WIDTH = 84;

// Revealed behind a row on swipe-left. Fixed width per action, label allowed
// to wrap to two lines (and shrink a little) so "削除" / "ブロック" and the
// English labels all fit the same slot.
const SwipeAction = ({
  icon,
  label,
  background,
  foreground,
  onPress,
}: {
  icon: IconName;
  label: string;
  background: string;
  foreground: string;
  onPress: () => void;
}) => {
  const ts = useTypeScale();
  return (
    <TouchableOpacity
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={{
        width: ACTION_WIDTH,
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
        paddingHorizontal: 6,
        backgroundColor: background,
      }}
    >
      <MaterialCommunityIcons name={icon} size={22} color={foreground} />
      <Text
        className={ts.label}
        style={{ color: foreground, textAlign: "center" }}
        numberOfLines={2}
        adjustsFontSizeToFit
        minimumFontScale={0.85}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

// All friends: swipe left to reveal Remove / Block, or tap a friend for the
// same two options in an action sheet (replaces the old removeFriend screen
// with its always-visible red buttons).
const FriendsListScreen = () => {
  // useGetMyFriends already fetches on focus internally -- the initial load
  // comes from that, so we only need to call getMyFriends() here to refresh
  // after a mutation (remove/block) while staying on this screen.
  const { myFriends, getMyFriends, isLoading } = useGetMyFriends();
  const { removeFriend } = useRemoveFriend();
  const { blockUser } = useBlockUser();
  const { t } = useTranslation();
  const ts = useTypeScale();
  const colors = useThemeColors();
  // One open row at a time: opening a row closes the previously open one
  const rowRefs = useRef<Record<string, SwipeRowHandle | null>>({});
  const openRowId = useRef<string | null>(null);
  // Friend whose tap-opened action sheet is showing
  const [sheetFriend, setSheetFriend] = useState<Friend | null>(null);

  const closeRow = (friendId: string) => rowRefs.current[friendId]?.close();

  const handleRowOpen = (friendId: string) => {
    if (openRowId.current && openRowId.current !== friendId) {
      closeRow(openRowId.current);
    }
    openRowId.current = friendId;
  };

  const handleRemove = (friend: Friend) => {
    Alert.alert(
      t("friends.removeScreen.removeConfirmTitle", { name: friend.nickname }),
      "",
      [
        { text: t("common.cancel"), style: "cancel", onPress: () => closeRow(friend._id) },
        {
          text: t("common.remove"),
          style: "destructive",
          onPress: async () => {
            const success = await removeFriend(friend.uniqueId);
            if (success) getMyFriends();
            else closeRow(friend._id);
          },
        },
      ]
    );
  };

  const handleBlock = (friend: Friend) => {
    Alert.alert(
      t("friends.removeScreen.blockConfirmTitle", { name: friend.nickname }),
      "",
      [
        { text: t("common.cancel"), style: "cancel", onPress: () => closeRow(friend._id) },
        {
          text: t("common.block"),
          style: "destructive",
          onPress: async () => {
            const success = await blockUser(friend._id);
            if (success) getMyFriends();
            else closeRow(friend._id);
          },
        },
      ]
    );
  };

  const friends: Friend[] = myFriends ?? [];

  return (
    <View className="flex-1 bg-bg">
      <StackHeader title={t("friends.hub.allFriends")} />
      {isLoading && friends.length === 0 ? (
        <View className="mt-10 items-center">
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
          {friends.length === 0 ? (
            <Text className={`${ts.body} text-inkMuted text-center mt-10`}>
              {t("friends.removeScreen.empty")}
            </Text>
          ) : (
            <>
              <Text className={`${ts.label} text-inkMuted mx-1.5 mb-3`}>
                {t("friends.swipeHint")}
              </Text>
              <View className="bg-surface border border-border rounded-[20px] overflow-hidden">
                {friends.map((friend, index) => (
                  <SwipeRow
                    key={friend._id}
                    ref={(handle) => {
                      rowRefs.current[friend._id] = handle;
                    }}
                    actionsWidth={ACTION_WIDTH * 2}
                    onOpen={() => handleRowOpen(friend._id)}
                    onPress={() => setSheetFriend(friend)}
                    actions={
                      <>
                        <SwipeAction
                          icon="account-remove-outline"
                          label={t("common.remove")}
                          background={colors.surfaceMuted}
                          foreground={colors.ink}
                          onPress={() => handleRemove(friend)}
                        />
                        <SwipeAction
                          icon="account-cancel-outline"
                          label={t("common.block")}
                          background={colors.danger}
                          foreground={colors.onDanger}
                          onPress={() => handleBlock(friend)}
                        />
                      </>
                    }
                  >
                    <View
                      className={`flex-row items-center px-4 py-3 gap-3 bg-surface ${
                        index > 0 ? "border-t border-divider" : ""
                      }`}
                      style={{ minHeight: 64 }}
                      // Swipe isn't reachable with VoiceOver -- expose the
                      // same two actions through the accessibility rotor.
                      accessible
                      accessibilityLabel={friend.nickname}
                      accessibilityActions={[
                        { name: "remove", label: t("common.remove") },
                        { name: "block", label: t("common.block") },
                      ]}
                      onAccessibilityAction={(event) => {
                        if (event.nativeEvent.actionName === "remove") handleRemove(friend);
                        if (event.nativeEvent.actionName === "block") handleBlock(friend);
                      }}
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
                      <MaterialCommunityIcons
                        name="dots-horizontal"
                        size={20}
                        color={colors.inkSubtle}
                        accessibilityElementsHidden
                      />
                    </View>
                  </SwipeRow>
                ))}
              </View>
            </>
          )}
        </ScrollView>
      )}
      <ActionSheet
        visible={sheetFriend !== null}
        onClose={() => setSheetFriend(null)}
        title={sheetFriend?.nickname}
        options={
          sheetFriend
            ? [
                {
                  label: t("common.remove"),
                  icon: "account-remove-outline",
                  onPress: () => handleRemove(sheetFriend),
                },
                {
                  label: t("common.block"),
                  icon: "account-cancel-outline",
                  variant: "danger",
                  onPress: () => handleBlock(sheetFriend),
                },
              ]
            : []
        }
      />
    </View>
  );
};

export default FriendsListScreen;
