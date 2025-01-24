import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "expo-router";

const Logout = () => {
  const router = useRouter();
  const { onLogout } = useAuth();

  useEffect(() => {
    const handleLogout = async () => {
      try {
        if (onLogout) {
          await onLogout();
          router.replace("(guest-screens)/Login" as any);
        }
      } catch (e) {
        console.log(e);
      }
    };
    handleLogout();
  }, []);
};

export default Logout;
