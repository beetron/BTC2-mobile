import { View, Text } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "../hooks/useTranslation";
import { useTypeScale } from "../hooks/useTypeScale";

// The signed-in user's friend code as a card: QR + who it belongs to.
const UserQrCode = () => {
  const { authState } = useAuth();
  const { t } = useTranslation();
  const ts = useTypeScale();
  const user = authState?.user;
  const uniqueId = user?.uniqueId;

  if (!uniqueId) return null;

  return (
    <View className="items-center bg-surface border border-border rounded-[24px] px-6 py-6 gap-4">
      {/* White backing in both themes -- scanners need dark-on-light contrast */}
      <View
        className="p-2.5 rounded-xl"
        style={{ backgroundColor: "#FFFFFF" }}
        accessible
        accessibilityRole="image"
        accessibilityLabel={t("friends.qr.a11y", { id: uniqueId })}
      >
        <QRCode value={uniqueId} size={100} />
      </View>
      <View className="items-center gap-1">
        <Text className={`${ts.title} text-ink text-center`} numberOfLines={1}>
          {user?.nickname || user?.username}
        </Text>
        <Text className={`${ts.body} text-inkMuted text-center`} selectable>
          {t("friends.hub.idPrefix", { id: uniqueId })}
        </Text>
      </View>
      <Text className={`${ts.label} text-inkMuted text-center`}>{t("friends.qr.hint")}</Text>
    </View>
  );
};

export default UserQrCode;
