import { View, ScrollView } from "react-native";
import React from "react";
import EditAddFriendRow from "./EditAddFriendRow";
import EditFriendRequestsRow from "./EditFriendRequestsRow";
import EditBlockedFriend from "./EditBlockedFriend";
import EditRemoveFriend from "./EditRemoveFriend";
import SettingsSection from "./SettingsSection";
import { useTranslation } from "../hooks/useTranslation";

const EditContainer = () => {
  const { t } = useTranslation();

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }}
    >
      <View className="flex bg-btc500 h-full w-full p-6">
        <SettingsSection title={t("tabs.editFriends")}>
          <EditAddFriendRow />
          <EditRemoveFriend />
          <EditBlockedFriend />
          <EditFriendRequestsRow />
        </SettingsSection>
      </View>
    </ScrollView>
  );
};

export default EditContainer;
