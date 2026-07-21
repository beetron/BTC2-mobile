import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Alert } from "react-native";
import { Tabs } from "expo-router";
import { useAuth } from "../../../context/AuthContext";
import React from "react";
import HeaderPrimary from "../../../components/HeaderPrimary";
import { useTranslation } from "../../../hooks/useTranslation";

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
          tabBarActiveTintColor: "skyblue",
          tabBarInactiveTintColor: "white",
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
              <FontAwesome5 size={24} name="user-friends" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="editFriends"
          options={{
            title: t("tabs.editFriends"),
            tabBarIcon: ({ color }) => (
              <FontAwesome5 size={24} name="user-edit" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: t("tabs.settings"),
            tabBarIcon: ({ color }) => (
              <Ionicons name="settings-sharp" size={24} color={color} />
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
              <MaterialIcons name="logout" size={24} color={color} />
            ),
          }}
        />
      </Tabs>
    </>
  );
};

export default TabsLayout;
