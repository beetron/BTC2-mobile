import { View, Text, ActivityIndicator } from "react-native";
import { useState, useCallback, useEffect } from "react";
import useGetFriendRequests from "@/hooks/useGetFriendRequests";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useFocusEffect } from "expo-router";
import { Image } from "expo-image";
import { placeholderProfileImage } from "@/constants/images";
import useAcceptFriend from "@/hooks/useAcceptFriend";
import useRejectFriend from "@/hooks/useRejectFriend";
import { useAppStateListener } from "@/context/AppStateContext";

interface Friend {
  _id: string;
  uniqueId: string;
  nickname: string;
  profileImage: string;
  profileImageData?: string;
}

const EditFriendRequests = () => {
  const [shouldRender, setShouldRender] = useState(false);
  const { getFriendRequests, isLoading, friendRequests } =
    useGetFriendRequests();
  const { acceptFriend, isLoading: acceptIsLoading } = useAcceptFriend();
  const { rejectFriend, isLoading: rejectIsLoading } = useRejectFriend();

  useAppStateListener(() => {
    getFriendRequests();
    console.log("App state changed, refreshing friend requests");
  });

  useEffect(() => {
    getFriendRequests();
  }, [shouldRender]);

  // Refresh list when screen is focused
  useFocusEffect(
    useCallback(() => {
      getFriendRequests();
    }, [])
  );

  // Handle onPress accept
  const handleOnPressAccept = async (friendId: string) => {
    const success = await acceptFriend(friendId);
    if (success) {
      setShouldRender((prev) => !prev);
    }
  };

  // Handle onPress reject
  const handleOnPressReject = async (friendId: string) => {
    const success = await rejectFriend(friendId);
    if (success) {
      setShouldRender((prev) => !prev);
    }
  };

  return (
    <View className="bg-btc500">
      <View className="items-start">
        <Text className="text-btc100 font-funnel-regular text-2xl">
          Pending Friend Requests
        </Text>
      </View>
      <View className="mt-2 flex-col">
        {isLoading ? (
          <View className="mt-8 flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="white" />
          </View>
        ) : (
          <>
            {!friendRequests || friendRequests.length === 0 ? (
              <View className="mt-2 flex-1 items-center justify-center">
                <Text className="text-btc100 font-funnel-regular text-2xl">
                  You have no pending friend requests
                </Text>
              </View>
            ) : (
              friendRequests.map((friend: Friend) => (
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
                      name="checkcircleo"
                      size={28}
                      color="#AAFF00"
                      className="mr-4"
                      onPress={() => handleOnPressAccept(friend.uniqueId)}
                    />
                    <AntDesign
                      name="closecircleo"
                      size={28}
                      color="red"
                      onPress={() => handleOnPressReject(friend.uniqueId)}
                    />
                  </View>
                </View>
              ))
            )}
          </>
        )}
      </View>
    </View>
  );
};

export default EditFriendRequests;
