import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { Image } from "expo-image";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { images } from "../constants/images";
import useGetMyFriends from "../hooks/useGetMyFriends";

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
  emptyMessage = "Add a friend first to start a group.",
}: FriendSelectListProps) => {
  const placeholderProfileImage = images.placeholderProfileImage;
  const { myFriends, isLoading } = useGetMyFriends();

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
        <ActivityIndicator size="small" color="white" />
      </View>
    );
  }

  if (candidates.length === 0) {
    return (
      <Text className="font-funnel-regular text-btc100 text-lg text-center mt-4">
        {emptyMessage}
      </Text>
    );
  }

  return (
    <View className="w-full" style={{ maxHeight: 300 }}>
      {candidates.map((friend) => {
        const isSelected = selectedIds.includes(friend._id);
        return (
          <Pressable
            key={friend._id}
            onPress={() => toggle(friend._id)}
            className="flex-row items-center justify-between w-full py-2"
          >
            <View className="flex-row items-center gap-4 flex-1 min-w-0">
              {friend.profileImageData ? (
                <Image
                  source={{ uri: friend.profileImageData }}
                  style={{ width: 40, height: 40, borderRadius: 40 }}
                  className="bg-btc100 flex-shrink-0"
                />
              ) : (
                <Image
                  source={placeholderProfileImage}
                  style={{ width: 40, height: 40, borderRadius: 40 }}
                  className="bg-btc100"
                />
              )}
              <Text
                className="text-btc100 font-funnel-regular text-xl flex-1"
                numberOfLines={1}
              >
                {friend.nickname}
              </Text>
            </View>
            <MaterialCommunityIcons
              name={isSelected ? "checkbox-marked" : "checkbox-blank-outline"}
              size={26}
              color={isSelected ? "#75E6DA" : "#D4F1F4"}
            />
          </Pressable>
        );
      })}
    </View>
  );
};

export default FriendSelectList;
