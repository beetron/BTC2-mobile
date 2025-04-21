import { useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

const Logout = () => {
  const { onLogout } = useAuth();

  useEffect(() => {
    const handleLogout = async () => {
      try {
        if (onLogout) {
          await onLogout();
        }
      } catch (e) {
        console.log(e);
      }
    };
    handleLogout();
  }, []);
};

export default Logout;
