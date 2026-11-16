import { View, ActivityIndicator } from "react-native";
import { useThemeColors } from "../context/ThemeContext";

// Shown while the saved session is still being restored at launch
// (authState.authenticated === null). Normally the native splash screen
// covers this; it only becomes visible if the restore is unusually slow.
const AuthCheckingScreen = () => {
  const colors = useThemeColors();
  return (
    <View className="flex-1 bg-bg justify-center items-center">
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
};

export default AuthCheckingScreen;
