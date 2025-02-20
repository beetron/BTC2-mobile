import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Redirect, Tabs } from "expo-router";
import { useAuth } from "../context/AuthContext";
import React from "react";

import TabsHeader from "@/components/TabsHeader";

const TabLayout = () => {
  const { authState } = useAuth();

  if (authState?.authenticated !== true) {
    return <Redirect href="/(guest-screens)/Login" />;
  }

  return (
    <>
      <TabsHeader />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: "skyblue",
          tabBarStyle: {
            backgroundColor: "#2a2a3c",
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color }) => (
              <FontAwesome5 size={24} name="user-friends" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="editFriends"
          options={{
            title: "Add/Remove",
            tabBarIcon: ({ color }) => (
              <FontAwesome5 size={24} name="user-edit" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: "Settings",
            tabBarIcon: ({ color }) => (
              <Ionicons name="settings-sharp" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="logout"
          options={{
            title: "Logout",
            tabBarIcon: ({ color }) => (
              <MaterialIcons name="logout" size={24} color={color} />
            ),
          }}
        />
      </Tabs>
    </>
  );
};

export default TabLayout;
