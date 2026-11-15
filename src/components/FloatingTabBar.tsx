import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useThemeColors } from "../context/ThemeContext";
import { useTypeScale } from "../hooks/useTypeScale";

// Floating pill tab bar (Chats design B). The active tab expands into a
// light chip with icon + label; the others are icon-only with an a11y label.
// Rendered in normal layout flow below the screen (not absolutely
// positioned), so no screen needs extra bottom padding to avoid it.
//
// The pill uses the ink color, so it's dark on the light theme and light on
// the dark theme -- the active chip inverts against it either way.
const FloatingTabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
  const colors = useThemeColors();
  const ts = useTypeScale();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        backgroundColor: colors.bg,
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: Math.max(insets.bottom - 4, 12),
      }}
    >
      <View
        accessibilityRole="tablist"
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-around",
          padding: 6,
          borderRadius: 32,
          backgroundColor: colors.ink,
          shadowColor: "#0F2530",
          shadowOpacity: 0.18,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 6 },
          elevation: 8,
        }}
      >
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const focused = state.index === index;
          const label = typeof options.title === "string" ? options.title : route.name;
          const iconColor = focused ? colors.ink : colors.inkSubtle;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              onLongPress={() => navigation.emit({ type: "tabLongPress", target: route.key })}
              activeOpacity={0.8}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={options.tabBarAccessibilityLabel ?? label}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                minHeight: 46,
                minWidth: 56,
                paddingHorizontal: focused ? 18 : 12,
                borderRadius: 23,
                backgroundColor: focused ? colors.bg : "transparent",
                // Lets the active chip shrink its label before it would push
                // the other tabs out of the pill
                flexShrink: focused ? 1 : 0,
              }}
            >
              {options.tabBarIcon?.({ focused, color: iconColor, size: 22 })}
              {focused ? (
                <Text
                  className={ts.bodyStrong}
                  style={{ color: colors.ink, flexShrink: 1 }}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.85}
                >
                  {label}
                </Text>
              ) : null}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default FloatingTabBar;
