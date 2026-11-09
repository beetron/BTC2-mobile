import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import AuthCheckingScreen from "../components/AuthCheckingScreen";

const Index = () => {
  const { authState } = useAuth();
  const router = useRouter();
  const [hasMounted, setHasMounted] = useState(false);
  const isChecking = authState?.authenticated === null;

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    // Wait for the saved session restore to finish before choosing a route,
    // otherwise a logged-in user is briefly sent to the Login screen
    if (!hasMounted || isChecking) return;

    if (authState?.authenticated === true) {
      router.replace("/members" as any);
    } else {
      router.replace("/guests/Login" as any);
    }
  }, [authState, hasMounted, isChecking, router]);

  return isChecking ? <AuthCheckingScreen /> : null;
};

export default Index;
