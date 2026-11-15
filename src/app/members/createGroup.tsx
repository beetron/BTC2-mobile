import { View, Text, ScrollView } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import StackHeader from "../../components/StackHeader";
import CustomInput from "../../components/CustomInput";
import FriendSelectList from "../../components/FriendSelectList";
import CustomButton from "../../components/CustomButton";
import useCreateGroup from "../../hooks/useCreateGroup";
import { useTranslation } from "../../hooks/useTranslation";
import { useTypeScale } from "../../hooks/useTypeScale";

const MAX_NAME_LENGTH = 60;

const CreateGroupScreen = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const ts = useTypeScale();
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
    <View className="flex-1 bg-bg">
      <StackHeader title={t("group.createTitle")} />
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 20 }}
        keyboardShouldPersistTaps="handled"
      >
        <CustomInput
          title=""
          value={name}
          onChangeText={(text) => setName(text.slice(0, MAX_NAME_LENGTH))}
          placeholder={t("group.namePlaceholder")}
          helperText={`${name.length}/${MAX_NAME_LENGTH}`}
        />

        <Text className={`${ts.sectionHeader} text-inkMuted mx-1 mt-5 mb-2`}>
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
