import React from "react";
import { View } from "react-native";
import { Image } from "expo-image";
import { images } from "../constants/images";

interface LogoProps {
  size?: number;
}

// App mark on its own white tile, so the teal artwork reads on both the
// light and dark backgrounds (the old white-to-blue logo vanished on light).
const Logo = ({ size = 88 }: LogoProps) => (
  <View
    accessibilityRole="image"
    accessibilityLabel="bTC2"
    style={{
      width: size,
      height: size,
      borderRadius: Math.round(size * 0.29),
      backgroundColor: "#FFFFFF",
      overflow: "hidden",
      shadowColor: "#1B7A9E",
      shadowOpacity: 0.16,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 8 },
      elevation: 4,
    }}
  >
    <Image
      source={images.appMark}
      style={{ width: "100%", height: "100%", borderRadius: Math.round(size * 0.29) }}
      contentFit="contain"
    />
  </View>
);

export default Logo;
