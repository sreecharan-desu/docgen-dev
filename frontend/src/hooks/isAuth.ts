import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function useIsAuth() {
  const navigate = useNavigate();
  const location = useLocation(); // Get current location
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token && location.pathname === "/auth/login") {
      navigate("/auth/login", { replace: true });
    }
    else if (!token) {
      navigate("/", { replace: true });
    }
    else if (token && (location.pathname === "/auth/login" || location.pathname === "/auth/register" || location.pathname === "/")) {
      navigate("/dashboard", { replace: true });
    }else {
      navigate(location.pathname, { replace: true });
    }
  }, [token, location.pathname, navigate]); // Runs only when token or location changes
}
