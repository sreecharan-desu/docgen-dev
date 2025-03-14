import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AppRoutes } from "./AppRoutes";
import { SpeedInsights } from "@vercel/speed-insights/react"
import { Analytics } from "@vercel/analytics/react"
import useIsAuth from "./hooks/isAuth";
import { RecoilRoot } from "recoil";

const queryClient = new QueryClient();


const App = () => (
  <RecoilRoot>
    <BrowserRouter>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <SpeedInsights />
            <AppRoutes />
            <Analytics />
          </TooltipProvider>
        </QueryClientProvider>
      </AuthProvider>
    </BrowserRouter>
  </RecoilRoot>
);

export default App;
