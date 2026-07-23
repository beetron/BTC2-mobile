import { View, Text, Keyboard, TouchableWithoutFeedback } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import RemoveFriendHeader from "../../components/RemoveFriendHeader";
import EditAddFriend from "../../components/EditAddFriend";
import { useTranslation } from "../../hooks/useTranslation";

const AddFriendScreen = () => {
  const { t } = useTranslation();

  return (
    <View className="flex-1 bg-btc500">
      <RemoveFriendHeader />
      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1 }}
        bottomOffset={100}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View className="flex-1 m-6">
            <Text className="text-btc100 font-funnel-semi-bold text-2xl mb-4">
              {t("friends.addFriend.title")}
            </Text>
            <EditAddFriend />
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAwareScrollView>
    </View>
  );
};

export default AddFriendScreen;
