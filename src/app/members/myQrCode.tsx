import { View, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import StackHeader from "../../components/StackHeader";
import UserQrCode from "../../components/UserQrCode";
import CustomButton from "../../components/CustomButton";
import { useTranslation } from "../../hooks/useTranslation";

// QR hub reached from the Friends tab's "QR code" tile: your own code to be
// scanned, plus the way to scan someone else's. Add-by-ID stays ID-only.
const MyQrCodeScreen = () => {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <View className="flex-1 bg-bg">
      <StackHeader title={t("friends.hub.scanQr")} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 24, gap: 16 }}>
        <UserQrCode />
        <CustomButton
          title={t("friends.qr.scanButton")}
          handlePress={() => router.push("/members/scanFriendQr")}
        />
      </ScrollView>
    </View>
  );
};

export default MyQrCodeScreen;
