import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs } from "expo-router";

const TabLayout = () => {
  return (
    <Tabs
      screenOptions={{
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
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="editFriends"
        options={{
          title: "Add/Remove",
          tabBarIcon: ({ color }) => (
            <FontAwesome5 size={24} name="user-edit" color={color} />
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => (
            <Ionicons name="settings-sharp" size={24} color={color} />
          ),
          headerShown: false,
        }}
      />
    </Tabs>
  );
};

export default TabLayout;
