import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Alert, View } from "react-native";
import { Tabs, useFocusEffect } from "expo-router";
import { useAuth } from "../../../context/AuthContext";
import React, { useCallback } from "react";
import HeaderPrimary from "../../../components/HeaderPrimary";
import TabBarBadge from "../../../components/TabBarBadge";
import { useTranslation } from "../../../hooks/useTranslation";
import { colors } from "../../../constants/colors";
import { useAppStateListener } from "../../../context/AppStateContext";
import useFriendRequestsCount from "../../../hooks/useFriendRequestsCount";
import friendRequestsStore from "../../../zustand/friendRequestsStore";
import unreadStore from "../../../zustand/unreadStore";

const TabsLayout = () => {
  const { onLogout } = useAuth();
  const { t } = useTranslation();
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

  const handleLogout = () => {
    Alert.alert(
      t("tabs.logoutConfirmTitle"),
      "",
      [
        {
          text: t("common.cancel"),
          style: "cancel",
        },
        {
          text: t("common.ok"),
          onPress: async () => {
            try {
              if (onLogout) {
                await onLogout();
              }
            } catch (e) {
              console.log(e);
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  return (
    <>
      <HeaderPrimary />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.accent,
          tabBarInactiveTintColor: colors.btc100,
          tabBarStyle: {
            backgroundColor: "#1f1f2e",
          },
          tabBarLabelStyle: {
            fontFamily: "funnel-regular",
            fontSize: 11,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: t("tabs.home"),
            tabBarIcon: ({ color }) => (
              <View>
                <MaterialCommunityIcons size={24} name="account-group" color={color} />
                <TabBarBadge count={totalUnreadCount} />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="editFriends"
          options={{
            title: t("tabs.editFriends"),
            tabBarIcon: ({ color }) => (
              <View>
                <MaterialCommunityIcons size={24} name="account-edit" color={color} />
                <TabBarBadge count={pendingCount} />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: t("tabs.settings"),
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons name="cog-outline" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="logout"
          listeners={{
            tabPress: (e) => {
              e.preventDefault();
              handleLogout();
            },
          }}
          options={{
            title: t("tabs.logout"),
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons name="logout" size={24} color={color} />
            ),
          }}
        />
      </Tabs>
    </>
  );
};

export default TabsLayout;
