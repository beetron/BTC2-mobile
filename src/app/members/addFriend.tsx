import { View, Keyboard, TouchableWithoutFeedback } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import StackHeader from "../../components/StackHeader";
import EditAddFriend from "../../components/EditAddFriend";
import { useTranslation } from "../../hooks/useTranslation";

const AddFriendScreen = () => {
  const { t } = useTranslation();

  return (
    <View className="flex-1 bg-bg">
      <StackHeader title={t("friends.hub.addById")} />
      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1 }}
        bottomOffset={100}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View className="flex-1 mx-4 my-5">
            <EditAddFriend />
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAwareScrollView>
    </View>
  );
};

export default AddFriendScreen;
