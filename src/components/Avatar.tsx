import React from "react";
import { View } from "react-native";
import { Image } from "expo-image";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { images } from "../constants/images";
import { useThemeColors } from "../context/ThemeContext";

interface AvatarProps {
  // base64/remote uri; falls back to the bundled placeholder
  uri?: string | null;
  size?: number;
  // Groups render as a rounded square with a group glyph instead of a photo
  group?: boolean;
}

const Avatar = ({ uri, size = 50, group }: AvatarProps) => {
  const colors = useThemeColors();

  if (group) {
    return (
      <View
        style={{
          width: size,
          height: size,
          borderRadius: Math.round(size * 0.32),
          backgroundColor: colors.primarySoft,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <MaterialCommunityIcons
          name="account-group"
          size={Math.round(size * 0.5)}
          color={colors.primary}
        />
      </View>
    );
  }

  return (
    <Image
      source={uri ? { uri } : images.placeholderProfileImage}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: colors.surfaceMuted,
      }}
      contentFit="cover"
    />
  );
};

export default Avatar;
