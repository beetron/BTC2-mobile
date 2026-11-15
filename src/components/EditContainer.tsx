import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import ScreenHeader from "./ScreenHeader";
import ListSection from "./ListSection";
import ListRow from "./ListRow";
import FriendRequestsSection from "./FriendRequestsSection";
import { useThemeColors } from "../context/ThemeContext";
import { useTranslation } from "../hooks/useTranslation";
import { useTypeScale } from "../hooks/useTypeScale";

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>["name"];

// Two-up action tile. flex: 1 + wrapping subtitle (up to 3 lines) so the
// pair stays side by side even when the Japanese subtitle runs long; the
// tile grows taller instead of overflowing sideways.
const HubTile = ({
  icon,
  title,
  subtitle,
  onPress,
  primary,
}: {
  icon: IconName;
  title: string;
  subtitle: string;
  onPress: () => void;
  primary?: boolean;
}) => {
  const colors = useThemeColors();
  const ts = useTypeScale();
  const fg = primary ? colors.onPrimary : colors.ink;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${subtitle}`}
      style={{
        flex: 1,
        minHeight: 128,
        padding: 16,
        borderRadius: 20,
        gap: 12,
        backgroundColor: primary ? colors.primary : colors.surface,
        borderWidth: primary ? 0 : 1,
        borderColor: colors.border,
      }}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: primary ? "rgba(255,255,255,0.18)" : colors.primarySoft,
        }}
      >
        <MaterialCommunityIcons name={icon} size={22} color={primary ? fg : colors.primary} />
      </View>
      <View className="gap-0.5">
        <Text className={ts.bodyStrong} style={{ color: fg }} numberOfLines={2}>
          {title}
        </Text>
        <Text
          className={ts.label}
          style={{ color: primary ? fg : colors.inkMuted, opacity: primary ? 0.85 : 1 }}
          numberOfLines={3}
        >
          {subtitle}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const EditContainer = () => {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <View className="flex-1">
      <ScreenHeader title={t("tabs.friends")} />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32, paddingTop: 4 }}
      >
        <View className="flex-row gap-3 mb-6">
          <HubTile
            primary
            icon="account-plus-outline"
            title={t("friends.hub.addById")}
            subtitle={t("friends.hub.addByIdSubtitle")}
            onPress={() => router.push("/members/addFriend")}
          />
          <HubTile
            icon="qrcode-scan"
            title={t("friends.hub.scanQr")}
            subtitle={t("friends.hub.scanQrSubtitle")}
            onPress={() => router.push("/members/myQrCode" as any)}
          />
        </View>

        <FriendRequestsSection />

        <ListSection title={t("friends.hub.manageTitle")} footer={t("friends.swipeHint")}>
          <ListRow
            icon="account-multiple-outline"
            label={t("friends.hub.allFriends")}
            // Typed-routes manifest regenerates on the next `expo start`
            onPress={() => router.push("/members/friendsList" as any)}
          />
          <ListRow
            icon="account-cancel-outline"
            label={t("friends.blockedRow")}
            onPress={() => router.push("/members/blockedFriend")}
          />
        </ListSection>
      </ScrollView>
    </View>
  );
};

export default EditContainer;
