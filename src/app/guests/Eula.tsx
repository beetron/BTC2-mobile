import { useState } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import Logo from "../../components/Logo";
import CustomButton from "../../components/CustomButton";
import { useRouter } from "expo-router";
import * as Linking from "expo-linking";
import * as SecureStore from "expo-secure-store";

const Eula = () => {
  const [hasViewedEula, setHasViewedEula] = useState(false);
  const router = useRouter();

  const handleViewEula = async () => {
    try {
      await Linking.openURL("https://beetron.github.io/BTC2-mobile/eula.html");
      setHasViewedEula(true);
    } catch (error) {
      Alert.alert(
        "Error",
        "Unable to open EULA. Please check your internet connection."
      );
    }
  };

  const handleAgree = async () => {
    if (!hasViewedEula) {
      Alert.alert(
        "Please Review EULA",
        "You must view the End User License Agreement before agreeing."
      );
      return;
    }

    try {
      await SecureStore.setItemAsync("eulaAccepted", "true");
      router.replace("./Login");
    } catch (error) {
      Alert.alert("Error", "Unable to save your agreement. Please try again.");
    }
  };

  return (
    <SafeAreaView className="h-full bg-btc500">
      <View
        style={{
          flex: 1,
          padding: 16,
          justifyContent: "center",
          alignItems: "center",
          marginTop: 40,
        }}
      >
        <Logo />

        <View className="w-4/5 items-center mt-8">
          <Text className="text-2xl font-funnel-medium text-btc100 text-center mb-6">
            Welcome to bTChatty2
          </Text>

          <Text className="text-lg font-funnel-regular text-btc200 text-center mb-8 leading-6">
            Before you can use the app, please review and accept our End User
            License Agreement.
          </Text>

          <TouchableOpacity onPress={handleViewEula} className="mb-8">
            <Text className="text-xl font-funnel-medium text-btc200 underline text-center">
              View End User License Agreement
            </Text>
          </TouchableOpacity>

          <Text className="text-base font-funnel-regular text-btc300 text-center mb-8 leading-5">
            By clicking "Agree", you confirm that you have read and agree to the
            terms and conditions.
          </Text>

          <CustomButton
            title="I Agree"
            isLoading={false}
            textStyles="font-funnel-regular"
            containerStyles="w-3/5"
            handlePress={handleAgree}
            disabled={!hasViewedEula}
          />

          {!hasViewedEula && (
            <Text className="text-sm font-funnel-regular text-btc300 text-center mt-4 leading-4">
              Please click the link above to view the EULA before agreeing
            </Text>
          )}
        </View>
      </View>
      <StatusBar style="light" />
    </SafeAreaView>
  );
};

export default Eula;
