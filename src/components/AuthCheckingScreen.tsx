import { View, ActivityIndicator } from "react-native";

// Shown while the saved session is still being restored at launch
// (authState.authenticated === null). Normally the native splash screen
// covers this; it only becomes visible if the restore is unusually slow.
const AuthCheckingScreen = () => (
  <View className="flex-1 bg-btc500 justify-center items-center">
    <ActivityIndicator size="large" color="white" />
  </View>
);

export default AuthCheckingScreen;
