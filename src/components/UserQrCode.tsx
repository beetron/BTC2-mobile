import { View, Text } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "../hooks/useTranslation";

const UserQrCode = () => {
  const { authState } = useAuth();
  const { t } = useTranslation();
  const uniqueId = authState?.user?.uniqueId;

  if (!uniqueId) return null;

  return (
    <View className="items-center mt-8">
      <Text className="text-btc200 font-funnel-regular text-sm mb-3">
        {t("friends.addFriend.myQrLabel")}
      </Text>
      {/* White backing regardless of theme -- QR contrast, not app chrome */}
      <View className="bg-white p-4 rounded-xl">
        <QRCode value={uniqueId} size={180} />
      </View>
      <Text className="text-btc100 font-funnel-regular text-base mt-3">
        {uniqueId}
      </Text>
    </View>
  );
};

export default UserQrCode;
