import { View, Text, FlatList, ActivityIndicator } from "react-native";
import { Image } from "expo-image";
import React, { useEffect } from "react";
import { useAppStateListener } from "../context/AppStateContext";
import friendStore from "../zustand/friendStore";
import useGetMessages from "../hooks/useGetMessages";
import useGetMessageImages from "../hooks/useGetMessageImages";
import formatDate from "../utils/formatDate";
import Autolink from "react-native-autolink";
import { images } from "../constants/images";
import useSetBadgeCount from "../hooks/useSetBadgeCount";
import MessageImageGallery from "./MessageImageGallery";

const ConversationMessages = () => {
  const { isLoading, isSyncing, getMessages } = useGetMessages();
  const { messages, selectedFriend, shouldRender } = friendStore();
  const { getMessageImageSource } = useGetMessageImages();
  // Using getMyFriends to use update BadgeCount (temporary solution)
  const { setBadgeCount } = useSetBadgeCount();
  const placeholderProfileImage = images.placeholderProfileImage;

  // Fetch messages when shouldRender changes via socket sigal
  useEffect(() => {
    getMessages();
    setBadgeCount();
  }, [shouldRender]);

  // Refresh messages when app becomes active
  useAppStateListener(() => {
    getMessages();
    setBadgeCount();
  });

  if (isLoading && messages.length === 0) {
    return (
      <View className="justify-center items-center mt-14">
        <Text className="font-funnel-regular text-btc100 text-2xl">
          Loading...
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1">
      {/* Subtle syncing indicator when fetching fresh messages but cache is displayed */}
      {isSyncing && messages.length > 0 && (
        <View className="flex-row items-center justify-center py-1 bg-btc400">
          <ActivityIndicator size="small" color="#75E6DA" />
          <Text className="font-funnel-regular text-btc100 text-xs ml-2">
            Syncing…
          </Text>
        </View>
      )}

      <FlatList
        className="flex-1"
        data={messages}
        inverted={true}
        keyExtractor={(item, index) => item._id || index.toString()}
        ListEmptyComponent={
          <View className="justify-center items-center mt-64">
            <Text className="font-funnel-regular text-btc100 text-2xl">
              You have no messages with{" "}
              {selectedFriend?.nickname ?? "your friend"}
            </Text>
          </View>
        }
        renderItem={({ item: message }) => (
          <View>
            {message.senderId === selectedFriend?._id ? (
              <View className="items-start mb-5 mr-auto max-w-[80%]">
                <View className="flex-row bg-btc400 rounded-e-2xl pl-2 p-4">
                  {selectedFriend.profileImageData ? (
                    <Image
                      source={{ uri: selectedFriend.profileImageData }}
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
                  <View className="flex-1 pl-2">
                    <Autolink
                      text={message.message}
                      className="text-btc100 text-lg"
                      linkStyle={{ color: "#75E6DA" }}
                    />
                    {message.imageFiles && message.imageFiles.length > 0 && (
                      <>
                        {console.log(
                          "🖼️ From friend - Rendering image gallery:",
                          message.imageFiles
                        )}
                        <MessageImageGallery
                          imageFilenames={message.imageFiles}
                          imageSources={message.imageFiles.map((filename) => {
                            const source = getMessageImageSource(filename);
                            console.log("📸 From friend image source:", source);
                            return source;
                          })}
                        />
                      </>
                    )}
                  </View>
                </View>
                <Text className="font-funnel-regular text-btc100 text-sm ml-2">
                  {formatDate(message.createdAt)}
                </Text>
              </View>
            ) : (
              <View className="item-end mb-5 ml-auto max-w-[80%]">
                <View className="flex bg-btc300 rounded-s-2xl pl-3 p-4">
                  <Autolink
                    text={message.message}
                    className="text-btc400 text-lg"
                    linkStyle={{ color: "#D4F1F4" }}
                  />
                  {message.imageFiles && message.imageFiles.length > 0 && (
                    <>
                      {console.log(
                        "🖼️ From me - Rendering image gallery:",
                        message.imageFiles
                      )}
                      <MessageImageGallery
                        imageFilenames={message.imageFiles}
                        imageSources={message.imageFiles.map((filename) => {
                          const source = getMessageImageSource(filename);
                          console.log("📸 From me image source:", source);
                          return source;
                        })}
                      />
                    </>
                  )}
                </View>
                <Text className="font-funnel-regular text-btc100 text-sm mr-2">
                  {formatDate(message.createdAt)}
                </Text>
              </View>
            )}
          </View>
        )}
      />
    </View>
  );
};

export default ConversationMessages;
