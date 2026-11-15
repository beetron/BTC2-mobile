import { ActivityIndicator, TouchableOpacity, View } from "react-native";
import { useState, useEffect } from "react";
import { useAuth } from "@/src/context/AuthContext";
import useGetProfileImage from "@/src/hooks/useGetProfileImage";
import * as ImagePicker from "expo-image-picker";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import useUpdateProfileImage from "@/src/hooks/useUpdateProfileImage";
import { useThemeColors } from "@/src/context/ThemeContext";
import { useTranslation } from "@/src/hooks/useTranslation";
import Avatar from "./Avatar";

const SIZE = 64;

const SettingsProfileImage = () => {
  const [image, setImage] = useState<string | null>(null);
  const { authState } = useAuth();
  const { getProfileImage, isLoading } = useGetProfileImage();
  const { updateProfileImage } = useUpdateProfileImage();
  const colors = useThemeColors();
  const { t } = useTranslation();

  // Fetch current profile image from backend
  useEffect(() => {
    const loadInitialImage = async () => {
      const currentImageUri = authState?.user?.profileImage;
      if (!currentImageUri) return;

      try {
        const image = await getProfileImage(currentImageUri);
        setImage(image);
      } catch (error) {
        console.error("Error loading profile photo:", error);
      }
    };
    loadInitialImage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Image picker function and update profile image with backend
  const pickImage = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        const newImageUri = result.assets[0].uri;

        // Upload new image to backend and update state
        const success = await updateProfileImage(newImageUri);

        if (success) {
          setImage(newImageUri);
        }
      }
    } catch (error) {
      console.error("Error in pickImage:", error);
    }
  };

  return (
    <View style={{ width: SIZE, height: SIZE }}>
      {isLoading ? (
        <View
          style={{
            width: SIZE,
            height: SIZE,
            borderRadius: SIZE / 2,
            backgroundColor: colors.surfaceMuted,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      ) : (
        <Avatar uri={image} size={SIZE} />
      )}
      <TouchableOpacity
        onPress={pickImage}
        accessibilityRole="button"
        accessibilityLabel={t("settings.profileImage.change")}
        hitSlop={8}
        style={{
          position: "absolute",
          right: -4,
          bottom: -4,
          width: 28,
          height: 28,
          borderRadius: 14,
          borderWidth: 2,
          borderColor: colors.surface,
          backgroundColor: colors.primary,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <MaterialCommunityIcons name="camera" size={14} color={colors.onPrimary} />
      </TouchableOpacity>
    </View>
  );
};

export default SettingsProfileImage;
