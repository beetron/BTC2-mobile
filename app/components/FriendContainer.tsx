import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import { useCallback, useState, useEffect } from "react";
import useGetMyFriends from "../../hooks/useGetMyFriends";
import Friend from "./Friend";
import { useFocusEffect } from "@react-navigation/native";
import { useAppStateListener } from "@/context/AppStateContext";
import FriendStore from "../../zustand/friendStore";
import useFcmToken from "../../hooks/useFcmToken";

interface Friend {
  _id: string;
  nickname: string;
  profileImage: string;
  profileImageData: string;
  unreadMessages: boolean;
  updatedAt: string;
}

const FriendContainer = () => {
  const { shouldRender, setMessages, setSelectedFriend } = FriendStore();
  const { myFriends, isLoading, getMyFriends } = useGetMyFriends();
  const [sortedFriends, setSortedFriends] = useState<Friend[]>([]);
  const { manageFcmToken } = useFcmToken();

  // Run Effect when screen is back in focus
  useFocusEffect(
    useCallback(() => {
      console.log("useFocusEffecT called");
      setMessages([]);
      setSelectedFriend(null);
      getMyFriends();
      console.log("Friends: ", myFriends);
    }, [getMyFriends])
  );

  // Update list when new message is received via socket notification
  useEffect(() => {
    getMyFriends();
  }, [shouldRender]);

  // Handle FCM token registration or renewal
  useEffect(() => {
    manageFcmToken();
  }, [manageFcmToken]);

  useAppStateListener(() => {
    getMyFriends();
    manageFcmToken();
    console.log("App state changed, refreshing friends list and FCM token");
  });

  // Sort friends by most recent messages
  useEffect(() => {
    function sortFriends() {
      if (myFriends.length > 0) {
        const sorted = [...myFriends].sort(/*...*/);
        setSortedFriends(sorted);
      } else {
        setSortedFriends([]);
      }
    }
    sortFriends();
  }, [myFriends]);

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="white" />
      </View>
    );
  } else {
    return (
      <ScrollView className="flex-1 p-4">
        <View className="flex-1 w-full">
          {sortedFriends.map((friend) => (
            <Friend key={friend._id} friend={friend} />
          ))}
        </View>
      </ScrollView>
    );
  }
};

export default FriendContainer;
