import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import React, { useState } from "react";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { images } from "../constants/images";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import axiosClient from "../utils/axiosClient";

interface FriendProps {
  _id: string;
  nickname: string;
  profileImage: string;
  profileImageData?: string;
  unreadCount: number;
  updatedAt: string;
}

// Every friend is shown here regardless of whether a conversation with them
// exists yet -- tapping lazily finds-or-creates the direct conversation
// (POST /conversations/direct is idempotent) before navigating, so there's
// no separate "start a new chat" step for the common case.
const ConversationListItem = ({ friend }: { friend: FriendProps }) => {
  const placeholderProfileImage = images.placeholderProfileImage;
  const { nickname, unreadCount } = friend;
  const [isOpening, setIsOpening] = useState(false);
  const router = useRouter();

  const handleOnPress = async () => {
    if (isOpening) return;
    try {
      setIsOpening(true);
      const res = await axiosClient.post("/conversations/direct", {
        userId: friend._id,
      });
      router.push(
        `/members/conversation?conversationId=${res.data.conversationId}`
      );
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.response?.data?.error || "Failed to open chat"
      );
    } finally {
      setIsOpening(false);
    }
  };

  return (
    <TouchableOpacity onPress={handleOnPress} disabled={isOpening}>
      <View className="bg-btc500 m-2" style={{ opacity: isOpening ? 0.5 : 1 }}>
        <View className="flex-row items-center justify-between w-full">
          <View className="flex-row items-center w-3/4">
            <View className="mr-6">
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
            </View>
            <Text className="text-btc100 text-xl font-funnel-semi-bold mr-6">
              {nickname}
            </Text>
          </View>
          {isOpening ? (
            <ActivityIndicator size="small" color="#75E6DA" />
          ) : unreadCount !== 0 ? (
            <View className="flex-row items-start justify-center w-1/4">
              <MaterialCommunityIcons
                name="message-alert-outline"
                size={24}
                color="#75E6DA"
              />
              <Text className="text-btc100 text-xl font-funnel-semi-bold ml-2">
                + {unreadCount}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default ConversationListItem;
