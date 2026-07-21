import { ActivityIndicator, View } from "react-native";
import { Image } from "expo-image";
import { useState, useEffect } from "react";
import { useAuth } from "@/src/context/AuthContext";
import useGetProfileImage from "@/src/hooks/useGetProfileImage";
import * as ImagePicker from "expo-image-picker";
import { images } from "@/src/constants/images";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import useUpdateProfileImage from "@/src/hooks/useUpdateProfileImage";
import { colors } from "@/src/constants/colors";

const SettingsProfileImage = () => {
  const [image, setImage] = useState<string | null>(null);
  const { authState } = useAuth();
  const { getProfileImage, isLoading } = useGetProfileImage();
  const { updateProfileImage } = useUpdateProfileImage();

  const placeholderImage = images.placeholderProfileImage;

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
    <View className="relative justify-center">
      {isLoading ? (
        <ActivityIndicator size="small" color={colors.btc100} />
      ) : (
        <>
          {image ? (
            <Image
              source={{ uri: image }}
              style={{ width: 80, height: 80, borderRadius: 50 }}
              className="bg-btc100"
            />
          ) : (
            <Image
              source={placeholderImage}
              style={{ width: 80, height: 80, borderRadius: 50 }}
              className="bg-btc100"
            />
          )}
        </>
      )}
      <MaterialCommunityIcons
        name="image-plus"
        size={22}
        color={colors.accent}
        onPress={pickImage}
        className="absolute bottom-0 right-0 bg-btc500 rounded-full p-0.5"
      />
    </View>
  );
};

export default SettingsProfileImage;
