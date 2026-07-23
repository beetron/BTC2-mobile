import { View, Text } from "react-native";
import RemoveFriendHeader from "../../components/RemoveFriendHeader";
import EditFriendRequests from "../../components/EditFriendRequests";
import { useTranslation } from "../../hooks/useTranslation";

const FriendRequestsScreen = () => {
  const { t } = useTranslation();

  return (
    <View className="flex-1 bg-btc500">
      <RemoveFriendHeader />
      <View className="m-6">
        <Text className="text-btc100 font-funnel-semi-bold text-2xl mb-4">
          {t("friends.requests.title")}
        </Text>
        <EditFriendRequests />
      </View>
    </View>
  );
};

export default FriendRequestsScreen;
