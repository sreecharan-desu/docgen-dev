import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, useNavigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AppRoutes } from "./AppRoutes";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Analytics } from "@vercel/analytics/react";
import { RecoilRoot } from "recoil";
import { useEffect, useState, useCallback } from "react";
import { toast } from "@/components/ui/use-toast";

const queryClient = new QueryClient();

const TokenWatcher = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAuth();
  const [hasShownToast, setHasShownToast] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const authRoutes = ["/", "/auth/login", "/auth/register"];

  const isTokenExpired = (token: string | null): boolean => {
    if (!token) return true;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expirationTime = payload.exp * 1000;
      return Date.now() >= expirationTime;
    } catch (error) {
      return true;
    }
  };

  const checkToken = useCallback(() => {
    const token = localStorage.getItem("token");
    const isAuthRoute = authRoutes.includes(location.pathname);

    if (isAuthRoute && (isInitialLoad || !token)) {
      return;
    }

    if (!token || isTokenExpired(token)) {
      if (!hasShownToast) {
        toast({
          title: "Session Expired",
          description: "Your session has expired, please sign in again",
          variant: "destructive",
        });
        setHasShownToast(true);
      }
      localStorage.removeItem("token");
      setUser(null);
      navigate("/");
    } else if (isInitialLoad) {
      setIsInitialLoad(false);
    }
  }, [navigate, location.pathname, setUser, hasShownToast, isInitialLoad]);

  useEffect(() => {
    const initialTimer = setTimeout(() => {
      checkToken();
      setIsInitialLoad(false);
    }, 1000);

    const interval = setInterval(() => {
      checkToken();
    }, 5000);

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "token") {
        if (!e.newValue || isTokenExpired(e.newValue)) {
          checkToken();
        }
      }
    };
    window.addEventListener("storage", handleStorageChange);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [checkToken]);

  return null;
};

const App = () => {
  return (
    <RecoilRoot>
      <BrowserRouter>
        <AuthProvider>
          <QueryClientProvider client={queryClient}>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <SpeedInsights />
              <TokenWatcher />
              <AppRoutes />
              <Analytics />
            </TooltipProvider>
          </QueryClientProvider>
        </AuthProvider>
      </BrowserRouter>
    </RecoilRoot>
  );
};

export default App;