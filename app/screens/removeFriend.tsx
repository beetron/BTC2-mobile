import { View, Text } from "react-native";
import { useState, useCallback, useEffect } from "react";
import AntDesign from "@expo/vector-icons/AntDesign";
import { Image } from "expo-image";
import { placeholderProfileImage } from "@/constants/images";
import useGetMyFriends from "@/hooks/useGetMyFriends";
import useRemoveFriend from "@/hooks/useRemoveFriend";
import RemoveFriendHeader from "../components/RemoveFriendHeader";

interface Friend {
  _id: string;
  uniqueId: string;
  nickname: string;
  profileImage: string;
  profileImageData?: string;
}

const removeFriend = () => {
  //   const [friends, setFriends] = useState<Friend[]>([]);
  const [shouldRender, setShouldRender] = useState(false);
  const { myFriends, getMyFriends, isLoading } = useGetMyFriends();
  const { removeFriend, isLoading: removeIsLoading } = useRemoveFriend();

  // Refresh list after removing a friend
  useEffect(() => {
    getMyFriends();
  }, [shouldRender]);

  // Handle onPress remove
  const handleOnPressRemove = async (friendId: string) => {
    const success = await removeFriend(friendId);
    if (success) {
      console.log("Friend removed successfully");
      setShouldRender((prev) => !prev);
    }
  };

  // Handle onPress Block (planned feature)
  const handleOnPressBlock = () => {};

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
            Removing a friend will remove yourself from their friend list.
          </Text>
        </View>
        <View className="mt-2 flex-col items-start max-w-[80%]">
          {!myFriends || myFriends.length === 0 ? (
            <Text className="text-btc100 font-funnel-regular text-2xl">
              You have no friends to remove
            </Text>
          ) : (
            myFriends.map((friend: Friend) => (
              <View
                key={friend._id}
                className="flex-row items-center justify-between w-full m-2"
              >
                <View className="flex-row items-center gap-4">
                  {friend.profileImageData ? (
                    <Image
                      source={{ uri: friend.profileImageData }}
                      style={{ width: 50, height: 50, borderRadius: 50 }}
                      className="bg-btc100"
                    />
                  ) : (
                    <Image
                      source={placeholderProfileImage}
                      style={{ width: 50, height: 50, borderRadius: 50 }}
                      className="bg-btc100"
                    />
                  )}
                  <Text className="text-btc200 font-funnel-regular text-2xl">
                    {friend.nickname}
                  </Text>
                </View>
                <View className="flex-row justify-end">
                  <AntDesign
                    name="closecircleo"
                    size={28}
                    color="red"
                    onPress={() => handleOnPressRemove(friend.uniqueId)}
                  />
                </View>
              </View>
            ))
          )}
        </View>
      </View>
    </View>
  );
};

export default removeFriend;
