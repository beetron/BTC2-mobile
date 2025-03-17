import messaging from "@react-native-firebase/messaging";

export default async function requestNotificationPermission() {
  console.log("Request Notification Called");
  const permStatus = await messaging().requestPermission();

  const enabled =
    permStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    permStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    console.log("Permission Authorization Status: ", permStatus);
  }
}
