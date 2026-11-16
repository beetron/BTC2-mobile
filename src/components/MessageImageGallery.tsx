import React, { forwardRef, useImperativeHandle, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { Image, ImageSource } from "expo-image";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import MessageImageModal from "./MessageImageModal";
import { useThemeColors } from "../context/ThemeContext";
import { useTypeScale } from "../hooks/useTypeScale";
import { useTranslation } from "../hooks/useTranslation";

interface MessageImageGalleryProps {
  imageFilenames: string[];
  imageSources: ImageSource[];
  // Touch-and-hold on a photo. The message bubble passes its own handler so
  // holding a photo opens the message menu like the rest of the bubble
  // (a photo fills almost the whole bubble). Saving lives in the viewer.
  onLongPress?: () => void;
  // The photo files were removed after the retention period (the message's
  // imagesExpiredAt). One placeholder per photo instead of loading them.
  expired?: boolean;
}

export interface MessageImageGalleryHandle {
  // Opens the full-screen viewer, e.g. from a VoiceOver action on the
  // message bubble (which groups the thumbnails into one element)
  open: (index?: number) => void;
}

const MessageImageGallery = forwardRef<MessageImageGalleryHandle, MessageImageGalleryProps>(({
  imageFilenames,
  imageSources,
  onLongPress,
  expired = false,
}, ref) => {
  const colors = useThemeColors();
  const ts = useTypeScale();
  const { t } = useTranslation();
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null
  );
  useImperativeHandle(ref, () => ({
    open: (index = 0) => {
      // Nothing to view once the files are gone
      if (imageSources.length > 0 && !expired) setSelectedImageIndex(index);
    },
  }));
  // Initialize loading state for all images
  const [loading, setLoading] = useState<{ [key: number]: boolean }>(() => {
    const initialLoading: { [key: number]: boolean } = {};
    imageSources.forEach((_, index) => {
      initialLoading[index] = true;
    });
    return initialLoading;
  });
  const [errors, setErrors] = useState<{ [key: number]: boolean }>({});

  const screenWidth = Dimensions.get("window").width;
  const imageSize = screenWidth * 0.4;

  if (imageSources.length === 0) {
    return null;
  }

  const handleImageLoad = (index: number) => {
    setLoading((prev) => ({ ...prev, [index]: false }));
  };

  const handleImageError = (index: number) => {
    setLoading((prev) => ({ ...prev, [index]: false }));
    setErrors((prev) => ({ ...prev, [index]: true }));
  };

  const isSingleImage = imageSources.length === 1;
  const gridSize = isSingleImage ? imageSize : imageSize / 2.2; // Slightly larger grid items
  const singleImageHeight = screenWidth * 0.55; // Bigger height for single image
  const gridSpacing = 6; // Consistent spacing between grid items

  if (expired) {
    // Plain Views, not touchables: there is nothing to open, and a hold on
    // them reaches the bubble's own long-press (the message menu) directly.
    // A single photo gets a compact tile with its label inside; several get
    // icon-only squares in the usual grid and one label underneath.
    return (
      <View className="mt-2" style={{ width: "100%" }}>
        {isSingleImage ? (
          <View
            className="bg-surfaceMuted rounded-2xl items-center justify-center gap-1.5 px-3 py-3"
            style={{ width: "100%", minHeight: 96 }}
          >
            <MaterialCommunityIcons name="image-off-outline" size={28} color={colors.inkMuted} />
            <Text className={`${ts.caption} text-inkMuted text-center`}>
              {t("conversation.quote.photoExpired")}
            </Text>
          </View>
        ) : (
          <>
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                width: "100%",
                justifyContent: "center",
              }}
            >
              {imageFilenames.map((filename, index) => (
                <View
                  key={`${filename}-${index}`}
                  className="bg-surfaceMuted items-center justify-center"
                  style={{
                    width: gridSize,
                    height: gridSize,
                    borderRadius: 16,
                    marginHorizontal: gridSpacing / 2,
                    marginBottom: gridSpacing,
                  }}
                >
                  <MaterialCommunityIcons name="image-off-outline" size={24} color={colors.inkMuted} />
                </View>
              ))}
            </View>
            <View className="bg-surfaceMuted rounded-xl px-2.5 py-1 self-center">
              <Text className={`${ts.caption} text-inkMuted text-center`}>
                {t("conversation.photosExpired", { count: imageFilenames.length })}
              </Text>
            </View>
          </>
        )}
      </View>
    );
  }

  const renderImageItem = ({
    item,
    index,
  }: {
    item: ImageSource;
    index: number;
  }) => (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => setSelectedImageIndex(index)}
      onLongPress={onLongPress}
      style={{
        width: isSingleImage ? "100%" : gridSize,
        height: isSingleImage ? singleImageHeight : gridSize,
        aspectRatio: isSingleImage ? undefined : 1,
        overflow: "hidden",
        borderRadius: 16,
      }}
    >
      {errors[index] ? (
        <View className="flex-1 bg-surfaceMuted rounded-2xl justify-center items-center">
          <MaterialCommunityIcons name="alert-circle-outline" size={32} color={colors.ink} />
        </View>
      ) : (
        <>
          {loading[index] && (
            <View
              style={{
                position: "absolute",
                inset: 0,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: colors.surfaceMuted,
                zIndex: 10,
              }}
            >
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          )}
          <Image
            source={item}
            style={{
              width: "100%",
              height: "100%",
            }}
            contentFit="cover"
            onLoad={() => handleImageLoad(index)}
            onError={() => handleImageError(index)}
          />
        </>
      )}
    </TouchableOpacity>
  );

  return (
    <>
      <View className="mt-2" style={{ width: "100%" }}>
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            width: "100%",
            justifyContent: isSingleImage ? "flex-start" : "center",
            alignItems: "center",
          }}
        >
          {imageSources.map((source, index) => (
            <View
              key={index}
              className="rounded-2xl"
              style={{
                width: isSingleImage ? "100%" : "auto",
                marginRight: !isSingleImage ? gridSpacing / 2 : 0,
                marginLeft: !isSingleImage ? gridSpacing / 2 : 0,
                marginBottom: !isSingleImage ? gridSpacing : 0,
                overflow: "hidden",
              }}
            >
              {renderImageItem({ item: source, index })}
            </View>
          ))}
        </View>
      </View>

      {selectedImageIndex !== null && (
        <MessageImageModal
          imageSources={imageSources}
          initialIndex={selectedImageIndex}
          onClose={() => setSelectedImageIndex(null)}
        />
      )}
    </>
  );
});

MessageImageGallery.displayName = "MessageImageGallery";

export default MessageImageGallery;
