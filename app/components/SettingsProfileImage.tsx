import { View } from "react-native";
import { Image } from "expo-image";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import useGetProfileImage from "@/hooks/useGetProfileImage";
import * as ImagePicker from "expo-image-picker";
import { placeholderProfileImage } from "@/constants/images";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import useUpdateProfileImage from "@/hooks/useUpdateProfileImage";

const SettingsProfileImage = () => {
  const [image, setImage] = useState<string | null>(null);
  const { authState } = useAuth();
  const { getProfileImage } = useGetProfileImage();
  const { updateProfileImage } = useUpdateProfileImage();

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
    <View className="mt-4 relative justify-center">
      {image ? (
        <Image
          source={{ uri: image }}
          style={{ width: 80, height: 80, borderRadius: 50 }}
          className="bg-btc100"
        />
      ) : (
        <Image
          source={placeholderProfileImage}
          style={{ width: 80, height: 80, borderRadius: 50 }}
          className="bg-btc100"
        />
      )}

      <MaterialIcons
        name="add-photo-alternate"
        size={28}
        color="white"
        onPress={pickImage}
        className="absolute top-0 left-0 -ml-2"
      />
    </View>
  );
};

export default SettingsProfileImage;
