import { useRef, useCallback } from "react";
import { View, Text, Alert } from "react-native";
import {
  CameraView,
  useCameraPermissions,
  BarcodeScanningResult,
} from "expo-camera";
import { useRouter, useFocusEffect } from "expo-router";
import RemoveFriendHeader from "../../components/RemoveFriendHeader";
import CustomButton from "../../components/CustomButton";
import useAddFriend from "../../hooks/useAddFriend";
import { useTranslation } from "../../hooks/useTranslation";

const ScanFriendQr = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const { addFriend } = useAddFriend();
  // Guards against onBarcodeScanned firing again for a later frame while
  // the first scan's addFriend request/navigation is still in flight.
  const hasScannedRef = useRef(false);

  useFocusEffect(
    useCallback(() => {
      hasScannedRef.current = false;
    }, [])
  );

  const handleBarcodeScanned = async ({ data }: BarcodeScanningResult) => {
    if (hasScannedRef.current) return;

    const scannedId = data.trim();
    const isValidFormat =
      scannedId.length >= 6 &&
      scannedId.length <= 20 &&
      /^[a-zA-Z0-9]+$/.test(scannedId);

    if (!isValidFormat) {
      Alert.alert(
        t("friends.scanQr.invalidQrTitle"),
        t("friends.scanQr.invalidQrMessage")
      );
      return;
    }

    hasScannedRef.current = true;
    await addFriend(scannedId);
    router.back();
  };

  return (
    <View className="flex-1 bg-btc500">
      <RemoveFriendHeader />
      <View className="flex-1 m-6">
        <Text className="text-btc100 font-funnel-semi-bold text-2xl mb-4">
          {t("friends.scanQr.title")}
        </Text>

        {!permission ? null : !permission.granted ? (
          <View className="flex-1 items-center justify-center">
            <Text className="text-btc100 font-funnel-regular text-lg text-center mb-4">
              {t("friends.scanQr.permissionMessage")}
            </Text>
            <CustomButton
              title={t("friends.scanQr.permissionButton")}
              handlePress={requestPermission}
              containerStyles="px-8"
            />
          </View>
        ) : (
          <View className="flex-1">
            <View className="flex-1 rounded-xl overflow-hidden">
              <CameraView
                style={{ flex: 1 }}
                facing="back"
                barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
                onBarcodeScanned={handleBarcodeScanned}
              />
            </View>
            <Text className="text-btc200 font-funnel-regular text-sm text-center mt-3">
              {t("friends.scanQr.instructions")}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default ScanFriendQr;
