import { View, Text, Pressable, ActivityIndicator } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import useGetMyFriends from "../hooks/useGetMyFriends";
import { useTranslation } from "../hooks/useTranslation";
import { useTypeScale } from "../hooks/useTypeScale";
import { useThemeColors } from "../context/ThemeContext";
import Avatar from "./Avatar";

interface FriendSelectListProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  excludeIds?: string[];
  emptyMessage?: string;
}

// Shared by createGroup.tsx and groupSettings.tsx's add-member flow --
// reuses the existing useGetMyFriends hook rather than a new data source.
const FriendSelectList = ({
  selectedIds,
  onChange,
  excludeIds = [],
  emptyMessage,
}: FriendSelectListProps) => {
  const { myFriends, isLoading } = useGetMyFriends();
  const { t } = useTranslation();
  const ts = useTypeScale();
  const colors = useThemeColors();
  const resolvedEmptyMessage = emptyMessage ?? t("group.friendSelectDefaultEmpty");

  const candidates = myFriends.filter((f) => !excludeIds.includes(f._id));

  const toggle = (friendId: string) => {
    if (selectedIds.includes(friendId)) {
      onChange(selectedIds.filter((id) => id !== friendId));
    } else {
      onChange([...selectedIds, friendId]);
    }
  };

  if (isLoading) {
    return (
      <View className="items-center justify-center py-6">
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  }

  if (candidates.length === 0) {
    return (
      <Text className={`${ts.body} text-inkMuted text-center mt-4`}>
        {resolvedEmptyMessage}
      </Text>
    );
  }

  return (
    <View className="w-full bg-surface border border-border rounded-[20px] overflow-hidden">
      {candidates.map((friend, index) => {
        const isSelected = selectedIds.includes(friend._id);
        return (
          <Pressable
            key={friend._id}
            onPress={() => toggle(friend._id)}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: isSelected }}
            className={`flex-row items-center justify-between w-full px-4 py-2.5 gap-3 ${
              index > 0 ? "border-t border-divider" : ""
            }`}
            style={{ minHeight: 58 }}
          >
            <View className="flex-row items-center gap-3 flex-1 min-w-0">
              <Avatar uri={friend.profileImageData} size={40} />
              <Text
                className={`${ts.body} text-ink flex-1`}
                numberOfLines={1}
              >
                {friend.nickname}
              </Text>
            </View>
            <MaterialCommunityIcons
              name={isSelected ? "checkbox-marked" : "checkbox-blank-outline"}
              size={26}
              color={isSelected ? colors.primary : colors.inkSubtle}
            />
          </Pressable>
        );
      })}
    </View>
  );
};

export default FriendSelectList;
