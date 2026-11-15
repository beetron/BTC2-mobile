import React, { useMemo, useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, Linking } from "react-native";
import { Image } from "expo-image";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import useLinkPreview from "../hooks/useLinkPreview";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "../hooks/useTranslation";
import { useThemeColors } from "../context/ThemeContext";
import { API_URL } from "../constants/api";

interface LinkPreviewCardProps {
  url: string;
}

const getHostname = (url: string): string => {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
};

const LinkPreviewCard: React.FC<LinkPreviewCardProps> = ({ url }) => {
  const colors = useThemeColors();
  const { authState } = useAuth();
  const { t } = useTranslation();
  const { data, isLoading, isError, hasContent } = useLinkPreview(url);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const hostname = useMemo(() => getHostname(url), [url]);

  const handlePress = () => {
    Linking.openURL(url).catch((err) =>
      console.warn("Failed to open link:", err)
    );
  };

  const imageSource =
    data?.image && !imageError
      ? {
          uri: `${API_URL}/link-preview/image?url=${encodeURIComponent(data.image)}`,
          headers: (authState?.token
            ? { Authorization: `Bearer ${authState.token}` }
            : {}) as Record<string, string>,
        }
      : null;

  if (isLoading && !data) {
    return (
      <View
        className="mt-2 rounded-2xl p-3 flex-row items-center"
        style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
      >
        <ActivityIndicator size="small" color={colors.inkMuted} />
        <Text className="font-funnel-regular text-ink text-sm ml-2">
          {t("conversation.linkPreview.loading")}
        </Text>
      </View>
    );
  }

  if (isError || !hasContent) {
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={handlePress}
        className="mt-2 rounded-2xl p-3 flex-row items-center"
        style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
      >
        <MaterialCommunityIcons name="web" size={20} color={colors.inkMuted} />
        <View className="ml-2 flex-1">
          <Text
            className="font-funnel-regular text-ink text-sm"
            numberOfLines={1}
          >
            {hostname}
          </Text>
          <Text className="font-funnel-regular text-inkMuted text-xs">
            {t("conversation.linkPreview.unavailable")}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={handlePress}
      className="mt-2 rounded-2xl overflow-hidden"
      style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
    >
      {imageSource && (
        <View style={{ width: "100%", height: 140 }}>
          {imageLoading && (
            <View
              style={{
                position: "absolute",
                inset: 0,
                justifyContent: "center",
                alignItems: "center",
                zIndex: 10,
              }}
            >
              <ActivityIndicator size="small" color={colors.inkMuted} />
            </View>
          )}
          <Image
            source={imageSource}
            style={{ width: "100%", height: "100%" }}
            contentFit="cover"
            onLoad={() => setImageLoading(false)}
            onError={() => {
              setImageLoading(false);
              setImageError(true);
            }}
          />
        </View>
      )}
      <View className="p-3">
        {data?.title && (
          <Text
            className="font-funnel-medium text-ink text-sm"
            numberOfLines={2}
          >
            {data.title}
          </Text>
        )}
        {data?.description && (
          <Text
            className="font-funnel-regular text-inkMuted text-xs mt-1"
            numberOfLines={2}
          >
            {data.description}
          </Text>
        )}
        <View className="flex-row items-center mt-1">
          <MaterialCommunityIcons name="web" size={12} color={colors.inkMuted} />
          <Text
            className="font-funnel-regular text-inkMuted text-xs ml-1"
            numberOfLines={1}
          >
            {data?.siteName || hostname}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default LinkPreviewCard;
