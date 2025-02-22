import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";

const index = () => {
  const { authState } = useAuth();
  const router = useRouter();
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (hasMounted) {
      if (authState?.authenticated === true) {
        router.replace("/members" as any);
      } else {
        router.replace("/guests/Login" as any);
      }
    }
  }, [authState, hasMounted, router]);
  return null;
};

export default index;
