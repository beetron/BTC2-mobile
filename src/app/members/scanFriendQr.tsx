import { useRef, useCallback } from "react";
import { View, Text, Alert, Linking } from "react-native";
import {
  CameraView,
  useCameraPermissions,
  BarcodeScanningResult,
} from "expo-camera";
import { useRouter, useFocusEffect } from "expo-router";
import StackHeader from "../../components/StackHeader";
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
      // onBarcodeScanned fires for every camera frame: hold further scans
      // until this alert is dismissed, or a non-friend QR code queued a
      // new alert per frame
      hasScannedRef.current = true;
      Alert.alert(
        t("friends.scanQr.invalidQrTitle"),
        t("friends.scanQr.invalidQrMessage"),
        [{ text: t("common.ok"), onPress: () => { hasScannedRef.current = false; } }],
        { cancelable: false }
      );
      return;
    }

    hasScannedRef.current = true;
    await addFriend(scannedId);
    router.back();
  };

  return (
    <View className="flex-1 bg-bg">
      <StackHeader title={t("friends.scanQr.title")} />
      <View className="flex-1 mx-4 my-5">

        {!permission ? null : !permission.granted ? (
          <View className="flex-1 items-center justify-center">
            <Text className="text-ink font-funnel-regular text-lg text-center mb-4">
              {t("friends.scanQr.permissionMessage")}
            </Text>
            {/* Denied before: iOS won't show the prompt again, so the
                button has to send the user to Settings instead */}
            <CustomButton
              title={
                permission.canAskAgain
                  ? t("friends.scanQr.permissionButton")
                  : t("friends.scanQr.openSettingsButton")
              }
              handlePress={
                permission.canAskAgain ? requestPermission : () => Linking.openSettings()
              }
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
            <Text className="text-inkMuted font-funnel-regular text-sm text-center mt-3">
              {t("friends.scanQr.instructions")}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default ScanFriendQr;
