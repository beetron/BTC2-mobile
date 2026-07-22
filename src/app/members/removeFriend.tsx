import { View, Text, ActivityIndicator } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import CustomButton from "../../components/CustomButton";
import useBlockUser from "@/src/hooks/useBlockUser";
import { Image } from "expo-image";
import { images } from "../../constants/images";
import useGetMyFriends from "@/src/hooks/useGetMyFriends";
import useRemoveFriend from "@/src/hooks/useRemoveFriend";
import RemoveFriendHeader from "../../components/RemoveFriendHeader";
import { useTranslation } from "../../hooks/useTranslation";
import { colors } from "../../constants/colors";

interface Friend {
  _id: string;
  uniqueId: string;
  nickname: string;
  profileImage: string;
  profileImageData?: string;
}

const RemoveFriendScreen = () => {
  const placeholderProfileImage = images.placeholderProfileImage;
  // useGetMyFriends already fetches on focus internally -- the initial load
  // comes from that, so we only need to call getMyFriends() here to refresh
  // after a mutation (remove/block) while staying on this screen.
  const { myFriends, getMyFriends, isLoading } = useGetMyFriends();
  const { removeFriend, isLoading: removeIsLoading } = useRemoveFriend();
  const { blockUser, isLoading: blockIsLoading } = useBlockUser();
  const { t } = useTranslation();

  // Handle onPress remove
  const handleOnPressRemove = async (friendId: string) => {
    const success = await removeFriend(friendId);
    if (success) {
      console.log("Friend removed successfully");
      getMyFriends();
    }
  };

  // Handle onPress Block friend
  const handleOnPressBlock = async (friendId: string) => {
    const success = await blockUser(friendId);
    if (success) {
      getMyFriends();
    }
  };

  return (
    <View className="flex-1 bg-btc500">
      <RemoveFriendHeader />
      <View className="bg-btc500 m-6">
        <View className="flex-row items-start max-w-[90%]">
          <MaterialCommunityIcons
            name="alert-circle-outline"
            size={28}
            color={colors.warning}
            className="m-2"
          />
          <Text className="text-btc100 font-funnel-regular text-xl">
            {t("friends.removeScreen.notice")}
          </Text>
        </View>
        {isLoading ? (
          <View className="mt-2 items-center jusitfy-center">
            <ActivityIndicator size="large" color={colors.btc100} />
          </View>
        ) : (
          <>
            <View className="mt-2 flex-col items-start w-full">
              {!myFriends || myFriends.length === 0 ? (
                <Text className="text-btc100 font-funnel-regular text-2xl mt-4">
                  {t("friends.removeScreen.empty")}
                </Text>
              ) : (
                myFriends.map((friend: Friend) => (
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
                    <View
                      className="flex-row justify-end items-center"
                      style={{ width: 180, marginLeft: 8 }}
                    >
                      <CustomButton
                        title={t("common.remove")}
                        handlePress={() => handleOnPressRemove(friend.uniqueId)}
                        variant="danger"
                        containerStyles="px-4 py-2 mr-2"
                        textStyles="text-base"
                      />

                      <CustomButton
                        title={t("common.block")}
                        handlePress={() => handleOnPressBlock(friend._id)}
                        variant="danger"
                        containerStyles="px-4 py-2"
                        textStyles="text-base"
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

export default RemoveFriendScreen;
