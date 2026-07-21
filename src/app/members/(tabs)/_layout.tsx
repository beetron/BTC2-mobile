import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Alert } from "react-native";
import { Tabs } from "expo-router";
import { useAuth } from "../../../context/AuthContext";
import React from "react";
import HeaderPrimary from "../../../components/HeaderPrimary";
import { useTranslation } from "../../../hooks/useTranslation";
import { colors } from "../../../constants/colors";

const TabsLayout = () => {
  const { onLogout } = useAuth();
  const { t } = useTranslation();

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
              <MaterialCommunityIcons size={24} name="account-group" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="editFriends"
          options={{
            title: t("tabs.editFriends"),
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons size={24} name="account-edit" color={color} />
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
