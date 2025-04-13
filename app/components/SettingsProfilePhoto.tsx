import { View, Text } from 'react-native'
import { Image } from 'expo-image'
import { useState, useEffect } from 'react'
import { useAuth } from "@/context/AuthContext";
import { useFocusEffect } from "@react-navigation/native";
import useGetMyProfilePhoto from '@/hooks/useGetMyProfilePhoto';


const SettingsProfilePhoto = () => {
  const [image, setImage] = useState<string | null>(null);
    const { authState } = useAuth();
    const { getMyProfilePhoto } = useGetMyProfilePhoto();

    const imageUri = authState?.user?.profilePhoto;

    useEffect(() => {
      const loadImage = async () => {
        if (imageUri) {
          try {
            const image = await getMyProfilePhoto(imageUri);
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
        console.log("SettingsProfilePhoto: ", imageUri);
    },)

  return (
    <View className="mt-4">
        <Text className="text-btc100 text-2xl font-funnel-regular">Profile Photo</Text>
        {image ? (
        <Image
          source={{ uri: image }}
          style={{ width: 75, height: 75, borderRadius: 50 }}
          className="bg-btc100"
        />
      ) : null}
    </View>
  )
}

export default SettingsProfilePhoto