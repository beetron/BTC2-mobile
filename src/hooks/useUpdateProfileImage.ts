import axiosClient from "@/src/utils/axiosClient";
import { useState } from "react";
import { useAuth } from "@/src/context/AuthContext";
import * as SecureStore from "expo-secure-store";
import { Alert } from "react-native";
import { useNetwork } from "@/src/context/NetworkContext";

const useUpdateProfileImage = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { authState, setAuthState } = useAuth();
  const { isConnected } = useNetwork();
  const USER_KEY = "user";

  const updateProfileImage = async (imageData: string) => {
    try {
      setIsLoading(true);

      if (!imageData) {
        throw new Error("No image data");
      }

      if (!isConnected) {
        Alert.alert(
          "No Internet Connection",
          "Please check your connection and try again"
        );
        return false;
      }

      // Create file from URI
      const filename = imageData.split("/").pop() || "image.jpg";
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : "image/jpeg";

      // Prepare form-data for the image
      const formData = new FormData();
      formData.append("profileImage", {
        uri: imageData,
        name: filename,
        type,
      } as any);
      console.log("Form data: ", formData);

      // Include key-value matching backend API
      const response = await axiosClient.put(
        "/users/updateprofileimage",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200) {
        console.log("Profile image updated successfully:", response.data);
        // Grab new file name from response
        const newFileName = response.data.profileImage;

        if (authState?.user && setAuthState) {
          const updatedUser = {
            ...authState.user,
            profileImage: newFileName,
          };

          // Update authState
          setAuthState({
            ...authState,
            user: updatedUser,
          });

          // Update SecureStore
          await SecureStore.setItemAsync(USER_KEY, JSON.stringify(updatedUser));
        }
        return true;
      }
    } catch (error: any) {
      console.error("Error updating profile image: ", error);

      if (error.networkError === "TIMEOUT") {
        Alert.alert(
          "Connection Timeout",
          "Request took too long. Please try again"
        );
      } else if (error.networkError === "NO_INTERNET") {
        // Already alerted in pre-flight check
      } else {
        Alert.alert("Error", "Failed to update profile image");
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  return { isLoading, updateProfileImage };
};

export default useUpdateProfileImage;
