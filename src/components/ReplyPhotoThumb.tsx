import React, { useState } from "react";
import { View } from "react-native";
import { Image } from "expo-image";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import useGetMessageImages from "../hooks/useGetMessageImages";
import { useThemeColors } from "../context/ThemeContext";

interface ReplyPhotoThumbProps {
  filename: string;
  size?: number;
}

// Small square preview of a quoted photo, used in reply quotes and the
// "Replying to" bar. Decorative: the text next to it already says "Photo".
// If the file can't load (e.g. it expired before the app heard about it),
// a photo icon takes its place instead of an empty square.
const ReplyPhotoThumb = ({ filename, size = 40 }: ReplyPhotoThumbProps) => {
  const colors = useThemeColors();
  const { getMessageImageSource } = useGetMessageImages();
  const [failed, setFailed] = useState(false);

  return (
    <View
      className="bg-surfaceMuted overflow-hidden items-center justify-center"
      style={{ width: size, height: size, borderRadius: 8, flexShrink: 0 }}
      accessible={false}
      importantForAccessibility="no-hide-descendants"
    >
      {failed ? (
        <MaterialCommunityIcons name="image-off-outline" size={size / 2} color={colors.inkMuted} />
      ) : (
        <Image
          source={getMessageImageSource(filename)}
          style={{ width: "100%", height: "100%" }}
          contentFit="cover"
          recyclingKey={filename}
          accessibilityIgnoresInvertColors
          onError={() => setFailed(true)}
        />
      )}
    </View>
  );
};

export default ReplyPhotoThumb;
