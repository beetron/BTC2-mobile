import { View, Text, ScrollView } from "react-native";
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
    const handleAppStateChange = () => {
      getMyFriends();
      manageFcmToken();
    };

    return () => {
      // Cleanup function to remove the listener
      console.log("Cleaning up useAppStateListener");
    };
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
        <Text className="text-3xl text-btc100">Loading...</Text>
      </View>
    );
  } else {
    return (
      <ScrollView className="flex-1">
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
