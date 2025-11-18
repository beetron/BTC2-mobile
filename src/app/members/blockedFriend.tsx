import { View, Text, ActivityIndicator, Alert } from "react-native";
import { useState, useEffect } from "react";
import AntDesign from "@expo/vector-icons/AntDesign";
import { Image } from "expo-image";
import { images } from "../../constants/images";
import useGetBlockedFriends from "@/src/hooks/useGetBlockedFriends";
import useUnblockUser from "@/src/hooks/useUnblockUser";
import friendStore from "@/src/zustand/friendStore";
import RemoveFriendHeader from "../../components/RemoveFriendHeader";

interface Friend {
  _id: string;
  uniqueId: string;
  nickname: string;
  profileImage: string;
  profileImageData?: string;
}

const BlockedFriend = () => {
  const placeholderProfileImage = images.placeholderProfileImage;
  const [shouldRender, setShouldRender] = useState(false);
  const { blockedFriends, getBlockedFriends, isLoading } =
    useGetBlockedFriends();

  useEffect(() => {
    getBlockedFriends();
  }, [shouldRender]);

  const { unblockUser } = useUnblockUser();

  const handleOnPress = async (friendId: string) => {
    try {
      const success = await unblockUser(friendId);
      if (success) {
        setShouldRender((prev) => !prev);
      }
    } catch (error) {
      console.error("Error unblocking user: ", error);
    }
  };

  return (
    <View className="flex-1 bg-btc500">
      <RemoveFriendHeader />
      <View className="bg-btc500 m-6">
        <View className="flex-row items-start max-w-[90%]">
          <AntDesign
            name="exclamationcircleo"
            size={28}
            color="yellow"
            className="m-2"
          />
          <Text className="text-btc100 font-funnel-regular text-xl">
            You could unblock users here. {"\n"}Unblocking enables sending
            friend requests again.
          </Text>
        </View>

        {isLoading ? (
          <View className="mt-2 items-center jusitfy-center">
            <ActivityIndicator size="large" color="white" />
          </View>
        ) : (
          <>
            <View className="mt-2 flex-col items-start w-full">
              {!blockedFriends || blockedFriends.length === 0 ? (
                <Text className="text-btc100 font-funnel-regular text-2xl mt-4">
                  You have no blocked users
                </Text>
              ) : (
                blockedFriends.map((friend: Friend) => (
                  <View
                    key={friend._id}
                    className="flex-row items-center justify-between w-full m-2"
                  >
                    <View className="flex-row items-center gap-4 flex-1 min-w-0">
                      {friend.profileImageData ? (
                        <Image
                          source={{ uri: friend.profileImageData }}
                          style={{ width: 50, height: 50, borderRadius: 50 }}
                          className="bg-btc100 flex-shrink-0"
                        />
                      ) : (
                        <Image
                          source={placeholderProfileImage}
                          style={{ width: 50, height: 50, borderRadius: 50 }}
                          className="bg-btc100"
                        />
                      )}
                      <Text
                        className="text-btc200 font-funnel-regular text-2xl flex-1"
                        numberOfLines={2}
                        ellipsizeMode="tail"
                      >
                        {friend.nickname}
                      </Text>
                    </View>
                    <View className="flex-row justify-end">
                      <AntDesign
                        name="unlock"
                        size={28}
                        color="skyblue"
                        onPress={() => handleOnPress(friend._id)}
                      />
                    </View>
                  </View>
                ))
              )}
            </View>
          </>
        )}
      </View>
    </View>
  );
};

export default BlockedFriend;
