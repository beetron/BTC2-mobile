import { useCallback } from "react";
import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";

const MAX_FILES = 10;
const MAX_TOTAL_SIZE = 49 * 1024 * 1024; // 49MB in bytes

interface AttachedImage {
  uri: string;
  name: string;
  type: string;
  size: number;
}

export const useAttachImages = () => {
  const attachImages = useCallback(async (): Promise<AttachedImage[]> => {
    try {
      // Request permissions
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Photo library access is required to attach images."
        );
        return [];
      }

      // Open picker with multi-select enabled
      // mediaTypes is now an array of MediaType strings instead of MediaTypeOptions
      // allowsMultipleSelection enables native multi-select UI
      // selectionLimit: 0 means unlimited, but we enforce MAX_FILES in validation
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsMultipleSelection: true,
        selectionLimit: MAX_FILES,
        quality: 0.8,
        exif: false,
      });

      if (result.canceled) {
        return [];
      }

      const selectedAssets = result.assets || [];

      // Validate file count
      if (selectedAssets.length > MAX_FILES) {
        Alert.alert(
          "Too Many Files",
          `Maximum ${MAX_FILES} files allowed per upload.`
        );
        return [];
      }

      // Validate total size and prepare images
      let totalSize = 0;
      const attachedImages: AttachedImage[] = [];

      for (const asset of selectedAssets) {
        if (!asset.uri) continue;

        // Get file size from asset
        const size = asset.fileSize || 0;
        totalSize += size;

        if (totalSize > MAX_TOTAL_SIZE) {
          Alert.alert(
            "File Size Exceeded",
            `Total file size cannot exceed 49MB. Current selection: ${(totalSize / (1024 * 1024)).toFixed(2)}MB`
          );
          return [];
        }

        // Extract filename from URI
        const filename =
          asset.uri.split("/").pop() || `image_${Date.now()}.jpg`;

        attachedImages.push({
          uri: asset.uri,
          name: filename,
          type: "image/jpeg",
          size,
        });
      }

      return attachedImages;
    } catch (error) {
      console.error("Error attaching images:", error);
      Alert.alert("Error", "Failed to attach images.");
      return [];
    }
  }, []);

  return { attachImages };
};
