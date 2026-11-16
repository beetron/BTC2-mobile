import ConversationListContainer from "../../../components/ConversationListContainer";
import { View } from "react-native";

// Home screen: every friend, tap to open (or lazily start) a chat with them
const Index = () => {
  return (
    <View className="flex-1 bg-bg">
      <ConversationListContainer />
    </View>
  );
};
export default Index;
