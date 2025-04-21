import axiosClient from "@/utils/axiosClient";
import { fromByteArray } from "base64-js";
import { API_PROFILE_IMAGE_URL } from "@/constants/api";

const getMimeType = (url: string): string => {
  const extension = url.toLowerCase().split(".").pop();

  switch (extension) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "heic":
      return "image/heic";
    default:
      return "image/jpeg";
  }
};

const useGetProfileImage = () => {
  const getProfileImage = async (url: string) => {
    try {
      console.log("Fetching profile image from URL:", url);
      const response = await axiosClient.get(`${API_PROFILE_IMAGE_URL}${url}`, {
        responseType: "arraybuffer",
      });

      if (response.status === 200) {
        const base64String = fromByteArray(new Uint8Array(response.data));
        const mimeType = getMimeType(url);
        return `data:${mimeType};base64,${base64String}`;
      } else {
        console.log("Non-200 response:", response.status);
      }
      return null;
    } catch (error) {
      console.error("Error fetching profile image: ", error);
      return null;
    }
  };
  return { getProfileImage };
};

export default useGetProfileImage;
