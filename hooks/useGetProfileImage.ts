import axiosClient from "@/utils/axiosClient";
import { fromByteArray } from "base64-js";

const getMimeType = (url: string): string => {
  const extension = url.toLowerCase().split('.').pop();
  
  switch (extension) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'heic':
      return 'image/heic';
    default:
      return 'image/jpeg';
  }
};

const useGetProfileImage = () => {
  const getProfileImage = async (url: string) => {
    try {
      const response = await axiosClient.get(url, {
        responseType: "arraybuffer"
      });

      if (response.status === 200) {
        const base64String = fromByteArray(new Uint8Array(response.data));
        const mimeType = getMimeType(url);
        return `data:${mimeType};base64,${base64String}`;
      }

      return null;
    } catch (error) {
      console.error('Error fetching profile photo:', error);
      return null;
    }
  };

  return { getProfileImage };
};

export default useGetProfileImage;