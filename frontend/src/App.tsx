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
  const location = useLocation(); // Added to check current route
  const { setUser } = useAuth();
  const [hasShownToast, setHasShownToast] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true); // Added to handle initial load

  const authRoutes = ["/", "/auth/login", "/auth/register"]; // Define auth-related routes

  const checkToken = useCallback(() => {
    const token = localStorage.getItem("token");
    const isAuthRoute = authRoutes.includes(location.pathname);

    // Skip check if on auth routes and it's initial load or no token yet
    if (isAuthRoute && (isInitialLoad || !token)) {
      return;
    }

    if (!token) {
      if (!hasShownToast) {
        toast({
          title: "Session Expired",
          description: "Token expired, please sign in again",
          variant: "destructive",
        });
        setUser(null);
        navigate("/");
        setHasShownToast(true);
      }
      setUser(null);
      navigate("/");
    } else if (isInitialLoad) {
      // If token exists on initial load, mark as loaded but don't redirect
      setIsInitialLoad(false);
    }
  }, [navigate, location.pathname, setUser, hasShownToast, isInitialLoad]);

  useEffect(() => {
    // Initial check with delay to allow login requests to complete
    const initialTimer = setTimeout(() => {
      checkToken();
      setIsInitialLoad(false);
    }, 1000); // 1 second delay for initial check

    // Start regular checking after initial load
    const interval = setInterval(checkToken, 1000);

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "token" && !e.newValue) {
        checkToken();
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

const App = () => (
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

export default App;