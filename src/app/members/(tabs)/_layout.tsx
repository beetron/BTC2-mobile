import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { View } from "react-native";
import { Tabs, useFocusEffect } from "expo-router";
import React, { useCallback } from "react";
import Badge from "../../../components/Badge";
import FloatingTabBar from "../../../components/FloatingTabBar";
import { useTranslation } from "../../../hooks/useTranslation";
import { useThemeColors } from "../../../context/ThemeContext";
import { useAppStateListener } from "../../../context/AppStateContext";
import useFriendRequestsCount from "../../../hooks/useFriendRequestsCount";
import friendRequestsStore from "../../../zustand/friendRequestsStore";
import unreadStore from "../../../zustand/unreadStore";

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>["name"];

const TabIcon = ({
  name,
  color,
  count,
  ringColor,
}: {
  name: IconName;
  color: string;
  count?: number;
  ringColor: string;
}) => (
  <View>
    <MaterialCommunityIcons size={22} name={name} color={color} />
    {count ? (
      <View style={{ position: "absolute", top: -7, left: 13 }}>
        <Badge count={count} small ringColor={ringColor} />
      </View>
    ) : null}
  </View>
);

const TabsLayout = () => {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const { pendingCount } = friendRequestsStore();
  const { totalUnreadCount } = unreadStore();
  const { refreshFriendRequestsCount } = useFriendRequestsCount();

  // Focus effect, not mount effect -- this used to be refreshed as a side
  // effect of the back button remounting the whole tab navigator. Now that
  // back genuinely pops instead, this layout stays mounted, so a plain
  // useEffect would leave the pending-requests badge stale after returning
  // from a conversation. Fires whenever the (tabs) route regains focus.
  useFocusEffect(
    useCallback(() => {
      refreshFriendRequestsCount();
    }, [refreshFriendRequestsCount])
  );

  useAppStateListener(() => {
    refreshFriendRequestsCount();
  });

  // Log out lives at the bottom of Settings now (SettingsContainer).
  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.bg },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("tabs.chats"),
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name={focused ? "chat" : "chat-outline"}
              color={color}
              count={totalUnreadCount}
              ringColor={focused ? colors.bg : colors.ink}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="editFriends"
        options={{
          title: t("tabs.friends"),
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name={focused ? "account-multiple" : "account-multiple-outline"}
              color={color}
              count={pendingCount}
              ringColor={focused ? colors.bg : colors.ink}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t("tabs.settings"),
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name={focused ? "cog" : "cog-outline"}
              color={color}
              ringColor={focused ? colors.bg : colors.ink}
            />
          ),
        }}
      />
    </Tabs>
  );
};

export default TabsLayout;
