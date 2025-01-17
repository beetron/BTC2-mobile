import { Redirect, Slot } from "expo-router";
import { AuthProvider, useAuth } from "./context/AuthContext";
import "../global.css";

const RootLayout = () => {
  return (
    <AuthProvider>
      <Slot />
      <RootLayoutAuth />
    </AuthProvider>
  );
};

const RootLayoutAuth = () => {
  const { authState, onLogout } = useAuth();

  // REMOVE AFTER TESTING
  console.log(authState);

  if (authState?.authenticated === true) {
    return <Redirect href="/(tabs)" />;
  } else {
    return <Redirect href="/" />;
  }
};

export default RootLayout;
