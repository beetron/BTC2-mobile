import { View, Text, Button } from 'react-native'
import { Image } from 'expo-image'
import { useState, useEffect } from 'react'
import { useAuth } from "@/context/AuthContext";
import { useFocusEffect } from "@react-navigation/native";
import useGetProfileImage from '@/hooks/useGetProfileImage';
import * as ImagePicker from "expo-image-picker";
import { placeholderProfileImage } from "@/constants/images";


const SettingsProfileImage = () => {
    const [imagePicker, setImagePicker] = useState<string | null>(null);
    const [image, setImage] = useState<string | null>(null);
    const { authState } = useAuth();
    const { getProfileImage } = useGetProfileImage();

    const imageUri = authState?.user?.profileImage;

    // Fetch and load image from URI
    useEffect(() => {
      const loadImage = async () => {
        if (imageUri) {
          console.log("Loading image from URI:", imageUri);
          try {
            const image = await getProfileImage(imageUri);
            setImage(image);
          } catch (error) {
            console.error('Error loading profile photo:', error);
            setImage(null);
          }
        }
      }
      loadImage();
    }, [imageUri]);

    useFocusEffect(() => {
        console.log("SettingsProfileImage: ", imageUri);
    },)

  // Image picker function
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log(result);

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  }

  return (
    <View className="mt-4">
        <Text className="text-btc100 text-2xl font-funnel-regular">Profile Photo</Text>
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
      <Button title="Pick an image from camera roll" onPress={pickImage} />
    </View>
  )
}

export default SettingsProfileImage