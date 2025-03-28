import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AppRoutes } from "./AppRoutes";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Analytics } from "@vercel/analytics/react";
import { RecoilRoot } from "recoil";


const App = () => (
  <RecoilRoot>
    <BrowserRouter>
      <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <SpeedInsights />
            <AppRoutes />
            <Analytics />
          </TooltipProvider>
      </AuthProvider>
    </BrowserRouter>
  </RecoilRoot>
);

export default App;