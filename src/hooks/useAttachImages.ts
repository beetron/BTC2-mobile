import { useCallback } from "react";
import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";
import { useTranslation } from "./useTranslation";

const MAX_FILES = 10;
const MAX_TOTAL_SIZE = 49 * 1024 * 1024; // 49MB in bytes

interface AttachedImage {
  uri: string;
  name: string;
  type: string;
  size: number;
}

export const useAttachImages = () => {
  const { t } = useTranslation();

  const attachImages = useCallback(async (): Promise<AttachedImage[]> => {
    try {
      // Request permissions
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(t("media.permissionDeniedTitle"), t("media.attachPermissionMessage"));
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
          t("media.tooManyFilesTitle"),
          t("media.tooManyFilesMessage", { max: MAX_FILES })
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
            t("media.fileSizeExceededTitle"),
            t("media.fileSizeExceededMessage", {
              size: (totalSize / (1024 * 1024)).toFixed(2),
            })
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
      Alert.alert(t("common.error"), t("media.attachFailed"));
      return [];
    }
  }, [t]);

  return { attachImages };
};
