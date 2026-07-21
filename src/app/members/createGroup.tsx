import { View, Text, TextInput, ScrollView } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import RemoveFriendHeader from "../../components/RemoveFriendHeader";
import FriendSelectList from "../../components/FriendSelectList";
import CustomButton from "../../components/CustomButton";
import useCreateGroup from "../../hooks/useCreateGroup";
import { useTranslation } from "../../hooks/useTranslation";

const MAX_NAME_LENGTH = 60;

const CreateGroupScreen = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const { createGroup, isLoading } = useCreateGroup();

  const canCreate = name.trim().length > 0 && selectedIds.length > 0 && !isLoading;

  const handleCreate = async () => {
    if (!canCreate) return;
    const conversationId = await createGroup(name.trim(), selectedIds);
    if (conversationId) {
      router.replace(`/members/conversation?conversationId=${conversationId}`);
    }
  };

  return (
    <View className="flex-1 bg-btc500">
      <RemoveFriendHeader />
      <ScrollView className="m-6">
        <Text className="text-btc100 font-funnel-semi-bold text-2xl mb-4">
          {t("group.createTitle")}
        </Text>

        <TextInput
          value={name}
          onChangeText={(text) => setName(text.slice(0, MAX_NAME_LENGTH))}
          placeholder={t("group.namePlaceholder")}
          placeholderTextColor="#7a7a8c"
          className="text-btc100 font-funnel-regular text-xl border-b-hairline border-btc100 pb-2 mb-6"
        />

        <Text className="text-btc200 font-funnel-regular text-lg mb-2">
          {t("group.addFriendsLabel")}
        </Text>
        <FriendSelectList selectedIds={selectedIds} onChange={setSelectedIds} />

        <View className="mt-8 mb-4">
          <CustomButton
            title={t("common.create")}
            handlePress={handleCreate}
            disabled={!canCreate}
            isLoading={isLoading}
            containerStyles="w-full"
          />
        </View>
      </ScrollView>
    </View>
  );
};

export default CreateGroupScreen;
