import { View, Text, ScrollView } from "react-native";
import { useCallback, useState, useEffect } from "react";
import useGetMyFriends from "@/hooks/useGetMyFriends";
import Friend from "./Friend";
import { useFocusEffect } from "@react-navigation/native";

interface Friend {
  _id: string;
  nickname: string;
  profilePhoto: string;
  unreadMessages: boolean;
  updatedAt: string;
}

const FriendContainer = () => {
  const { myFriends, isLoading, getMyFriends } = useGetMyFriends();
  const [sortedFriends, setSortedFriends] = useState<Friend[]>([]);

  useFocusEffect(
    useCallback(() => {
      // Fetch friends when the screen comes into focus
      getMyFriends();
      console.log("useFocusEffecT called");
    }, [getMyFriends])
  );

  useEffect(() => {
    if (myFriends.length > 0) {
      // Sort friends by recent messages
      const sorted = myFriends.sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
      setSortedFriends(sorted);
    }
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

// import { View, Text, ScrollView } from "react-native";
// import { useCallback, useState, useEffect } from "react";
// import useGetMyFriends from "@/hooks/useGetMyFriends";
// import Friend from "./Friend";
// import { useFocusEffect } from "@react-navigation/native";

// const FriendContainer = () => {
//   const { myFriends, isLoading, getMyFriends } = useGetMyFriends();
//   const [sortedFriends, setSortedFriends] = useState([]);

//   useFocusEffect(
//     useCallback(() => {
//       // Fetch friends when the screen comes into focus
//       getMyFriends();
//     }, [getMyFriends])
//   );

//   useEffect(() => {
//     if (myFriends.length > 0) {
//       // Sort friends by recent messages
//       const sorted = myFriends.sort(
//         (a, b) =>
//           new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
//       );
//       setSortedFriends(sorted);
//     }
//   }, [myFriends]);

//   if (isLoading) {
//     return (
//       <View className="flex-1 justify-center items-center">
//         <Text className="text-3xl text-btc100">Loading...</Text>
//       </View>
//     );
//   } else {
//     return (
//       <ScrollView className="flex-1">
//         <View className="flex-1 w-full">
//           {sortedFriends.map((friend) => (
//             <Friend key={friend._id} friend={friend} />
//           ))}
//         </View>
//       </ScrollView>
//     );
//   }
// };

// export default FriendContainer;
