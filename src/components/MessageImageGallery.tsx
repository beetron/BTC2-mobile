import React, { useState } from "react";
import {
  View,
  FlatList,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Share,
} from "react-native";
import { Image, ImageSource } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import MessageImageModal from "./MessageImageModal";

interface MessageImageGalleryProps {
  imageFilenames: string[];
  imageSources: ImageSource[];
}

const MessageImageGallery: React.FC<MessageImageGalleryProps> = ({
  imageFilenames,
  imageSources,
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null
  );
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
  const gridSize = isSingleImage ? imageSize : imageSize / 2.5;
  const singleImageHeight = screenWidth * 0.55; // Bigger height for single image

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
      onLongPress={() => {
        // Trigger native share menu on long press
        Share.share({
          url: (item.uri as string) || "",
          title: "Share Image",
        }).catch((err) => console.log("Share error:", err));
      }}
      style={{
        width: isSingleImage ? "100%" : gridSize,
        height: isSingleImage ? singleImageHeight : gridSize,
        aspectRatio: isSingleImage ? undefined : 1,
        overflow: "hidden",
      }}
    >
      {errors[index] ? (
        <View className="flex-1 bg-btc100 rounded-lg justify-center items-center">
          <Ionicons name="alert-circle-outline" size={32} color="#D4F1F4" />
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
                backgroundColor: "#D4F1F4",
                zIndex: 10,
              }}
            >
              <ActivityIndicator size="small" color="#75E6DA" />
            </View>
          )}
          <Image
            source={item}
            style={{
              width: "100%",
              height: "100%",
            }}
            contentFit={isSingleImage ? "contain" : "cover"}
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
          }}
        >
          {imageSources.map((source, index) => (
            <View
              key={index}
              className="rounded-lg"
              style={{
                width: isSingleImage ? "100%" : "auto",
                marginRight: !isSingleImage ? 4 : 0,
                marginBottom: !isSingleImage ? 4 : 0,
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
};

export default MessageImageGallery;
