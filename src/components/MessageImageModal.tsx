import React, { useState } from "react";
import {
  Modal,
  View,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Text,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Image, ImageSource } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import * as MediaLibrary from "expo-media-library";
import * as FileSystem from "expo-file-system";
import { useAuth } from "@/src/context/AuthContext";

interface MessageImageModalProps {
  imageSources: ImageSource[];
  initialIndex: number;
  onClose: () => void;
}

const MessageImageModal: React.FC<MessageImageModalProps> = ({
  imageSources,
  initialIndex,
  onClose,
}) => {
  const { authState } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
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
  const screenHeight = Dimensions.get("window").height;

  const [isSaving, setIsSaving] = useState(false);

  const handleImageLoad = (index: number) => {
    setLoading((prev) => ({ ...prev, [index]: false }));
  };

  const handleImageError = (index: number) => {
    setLoading((prev) => ({ ...prev, [index]: false }));
    setErrors((prev) => ({ ...prev, [index]: true }));
  };

  const handleScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const currentPageIndex = Math.round(contentOffsetX / screenWidth);
    setCurrentIndex(currentPageIndex);
  };

  const requestPermissions = async () => {
    try {
      const permission = await MediaLibrary.requestPermissionsAsync();
      return permission.granted;
    } catch (error) {
      console.error("Permission error:", error);
      return false;
    }
  };

  const downloadAndSaveImage = async (imageUri: string) => {
    try {
      // Generate a unique filename from timestamp
      const filename = `IMG_${Date.now()}.jpg`;
      const localPath = `${FileSystem.cacheDirectory}${filename}`;

      // Prepare download options with auth header
      const downloadOptions: any = {};
      if (authState?.token) {
        downloadOptions.headers = {
          Authorization: `Bearer ${authState.token}`,
        };
      }

      // Download the image to local cache
      const downloadResult = await FileSystem.downloadAsync(
        imageUri,
        localPath,
        downloadOptions
      );

      if (downloadResult.status !== 200) {
        throw new Error(`Download failed with status ${downloadResult.status}`);
      }

      // Save to media library
      await MediaLibrary.saveToLibraryAsync(downloadResult.uri);

      return true;
    } catch (error) {
      console.error("Download/Save error:", error);
      throw error;
    }
  };

  const handleSaveImage = async () => {
    try {
      setIsSaving(true);
      const granted = await requestPermissions();
      if (!granted) {
        Alert.alert(
          "Permission Denied",
          "Photos permission is required to save images."
        );
        return;
      }

      const currentImage = imageSources[currentIndex];
      if (!currentImage.uri) {
        Alert.alert("Error", "Image URI not available");
        return;
      }

      await downloadAndSaveImage(currentImage.uri as string);
      Alert.alert("Success", "Image saved to your photos!");
    } catch (error) {
      console.error("Save error:", error);
      Alert.alert("Error", "Failed to save image");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAllImages = async () => {
    try {
      setIsSaving(true);
      const granted = await requestPermissions();
      if (!granted) {
        Alert.alert(
          "Permission Denied",
          "Photos permission is required to save images."
        );
        return;
      }

      if (imageSources.length === 0) {
        Alert.alert("Error", "No images to save");
        return;
      }

      const uris = imageSources
        .map((img) => img.uri)
        .filter((uri): uri is string => typeof uri === "string");

      if (uris.length === 0) {
        Alert.alert("Error", "No valid image URIs");
        return;
      }

      let savedCount = 0;
      for (let i = 0; i < uris.length; i++) {
        try {
          await downloadAndSaveImage(uris[i]);
          savedCount++;
        } catch (error) {
          console.error(`Error saving image ${i + 1}:`, error);
          // Continue with next image
        }
      }

      Alert.alert(
        "Success",
        `Successfully saved ${savedCount} of ${uris.length} images to your photos!`
      );
    } catch (error) {
      console.error("Save all error:", error);
      Alert.alert("Error", "Failed to save images");
    } finally {
      setIsSaving(false);
    }
  };

  const renderImageItem = ({
    item,
    index,
  }: {
    item: ImageSource;
    index: number;
  }) => (
    <View
      style={{
        width: screenWidth,
        height: screenHeight - 16,
      }}
    >
      {errors[index] ? (
        <View className="flex-1 bg-btc100 justify-center items-center">
          <Ionicons name="alert-circle-outline" size={64} color="#D4F1F4" />
          <Text className="text-btc400 text-lg mt-4">Failed to load image</Text>
        </View>
      ) : (
        <>
          {loading[index] && (
            <View className="absolute inset-0 justify-center items-center bg-btc100 z-10">
              <ActivityIndicator size="large" color="#75E6DA" />
            </View>
          )}
          <Image
            source={item}
            style={{ width: "100%", height: "100%" }}
            contentFit="contain"
            onLoad={() => handleImageLoad(index)}
            onError={() => handleImageError(index)}
          />
        </>
      )}
    </View>
  );

  return (
    <Modal
      visible={true}
      transparent={false}
      animationType="fade"
      onRequestClose={onClose}
      hardwareAccelerated={true}
    >
      <View className="flex-1 bg-btc500">
        {/* Invisible safe area header - prevents touch conflicts with system gestures */}
        <View
          style={{
            height: 16,
            backgroundColor: "transparent",
          }}
        />

        {/* Image Gallery with swipe - Flex container */}
        <View className="flex-1">
          <FlatList
            data={imageSources}
            renderItem={renderImageItem}
            keyExtractor={(_, index) => index.toString()}
            horizontal
            pagingEnabled
            scrollEventThrottle={16}
            onScroll={handleScroll}
            initialScrollIndex={initialIndex}
            getItemLayout={(data, index) => ({
              length: screenWidth,
              offset: screenWidth * index,
              index,
            })}
            scrollIndicatorInsets={{ right: 1 }}
            showsHorizontalScrollIndicator={false}
          />

          {/* Close button as overlay - positioned in safe zone below system gesture area */}
          <View
            style={{
              position: "absolute",
              top: 60,
              left: 16,
              zIndex: 100,
            }}
          >
            <TouchableOpacity
              onPress={onClose}
              style={{
                width: 50,
                height: 50,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "rgba(5, 68, 94, 0.85)",
                borderRadius: 10,
              }}
              activeOpacity={0.6}
              hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
            >
              <Ionicons name="close" size={32} color="#75E6DA" />
            </TouchableOpacity>
          </View>

          {/* Image counter - positioned in safe zone at top */}
          <View
            style={{
              position: "absolute",
              top: 60,
              right: 16,
              zIndex: 100,
              backgroundColor: "rgba(42, 42, 60, 0.85)",
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 8,
            }}
          >
            <Text
              style={{
                color: "#D4F1F4",
                fontWeight: "bold",
                fontSize: 14,
              }}
            >
              {currentIndex + 1} / {imageSources.length}
            </Text>
          </View>

          {/* Save buttons - positioned near bottom */}
          <View
            style={{
              position: "absolute",
              bottom: 40,
              left: 16,
              right: 16,
              zIndex: 100,
              flexDirection: "row",
              gap: 12,
              justifyContent: "center",
            }}
          >
            <TouchableOpacity
              onPress={handleSaveImage}
              disabled={isSaving}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 24,
                paddingVertical: 16,
                backgroundColor: isSaving
                  ? "rgba(5, 68, 94, 0.5)"
                  : "rgba(5, 68, 94, 0.85)",
                borderRadius: 8,
                gap: 12,
              }}
            >
              {isSaving ? (
                <ActivityIndicator size={32} color="#75E6DA" />
              ) : (
                <Ionicons name="download" size={32} color="#75E6DA" />
              )}
              <Text
                style={{ color: "#75E6DA", fontSize: 18, fontWeight: "600" }}
              >
                {isSaving ? "Saving..." : "Save"}
              </Text>
            </TouchableOpacity>

            {imageSources.length > 1 && (
              <TouchableOpacity
                onPress={handleSaveAllImages}
                disabled={isSaving}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 24,
                  paddingVertical: 16,
                  backgroundColor: isSaving
                    ? "rgba(5, 68, 94, 0.5)"
                    : "rgba(5, 68, 94, 0.85)",
                  borderRadius: 8,
                  gap: 12,
                }}
              >
                {isSaving ? (
                  <ActivityIndicator size={32} color="#75E6DA" />
                ) : (
                  <Ionicons name="albums" size={32} color="#75E6DA" />
                )}
                <Text
                  style={{ color: "#75E6DA", fontSize: 18, fontWeight: "600" }}
                >
                  {isSaving ? "Saving..." : "Save All"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default MessageImageModal;
