import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, Menu, Home, ChevronRight } from "lucide-react";
import { useState, Suspense, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "@/components/dashboard/Sidebar";
import BillingSection from "@/components/dashboard/BillingSection";
import SettingsSection from "@/components/dashboard/SettingsSection";
import ProjectsSection from "@/components/dashboard/ProjectsSection";
import { DashboardSection } from "@/types";
import { useNavigate } from "react-router-dom";

// Skeleton loader component
const SkeletonLoader = () => (
  <div className="flex flex-col space-y-4 animate-pulse">
    <div className="h-12 bg-muted-foreground/10 rounded-md"></div>
    <div className="h-24 bg-muted-foreground/10 rounded-md"></div>
    <div className="h-40 bg-muted-foreground/10 rounded-md"></div>
  </div>
);

const Dashboard = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState("projects");
  const { user, logout } = useAuth();


  useEffect(() => {
    const location = window.location.pathname
    console.log("Condition",location == "/dashboard" && !localStorage.getItem("token"))
    if (location == "/dashboard" && !localStorage.getItem("token")) {
      setTimeout(()=>navigate('/'),2000)
    }
  }, [])

  // Extract user initials for Avatar fallback
  const getUserInitials = () => {
    if (!user?.name) return "U";
    return user.name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const navigate = useNavigate()

  // Render content based on active section
  const renderContent = () => {
    switch (activeSection) {
      case "pricing":
        return <BillingSection />;
      case "projects":
        return <ProjectsSection />;
      case "settings":
        return <SettingsSection user={user} />;
      case "docs":
          navigate("/docs");
          return;
      default:
        return <ProjectsSection />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-background to-background/95">
      {/* Sidebar */}
      <motion.div
        animate={{ width: isSidebarCollapsed ? 80 : 250 }}
        transition={{ type: "spring", stiffness: 250, damping: 20 }}
      >
        <Sidebar
          isSidebarCollapsed={isSidebarCollapsed}
          setIsSidebarCollapsed={setIsSidebarCollapsed}
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          user={user ? { ...user, avatarUrl: user.avatarUrl || "" } : null}
          logout={logout}
        />
      </motion.div>

      {/* Main content */}
      <motion.div
        className="flex-1 relative overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {/* Top navigation bar */}
        <div className="md:hidden flex items-center justify-between mb-6 bg-background/80 backdrop-blur-md fixed top-0 left-0 right-0 z-10 px-4 py-3 border-b border-white/10 shadow-sm">
          <Button variant="ghost" size="sm" className="p-1.5 hover:bg-white/10 transition-all duration-300">
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" className="p-1.5 hover:bg-white/10 transition-all duration-300 relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
            </Button>
            <Avatar className="h-8 w-8 ring-2 ring-white/20 hover:ring-white/40 transition-all duration-300">
              <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || user?.email || "User"}`} />
              <AvatarFallback className="bg-primary/80 text-primary-foreground">{getUserInitials()}</AvatarFallback>
            </Avatar>
          </div>
        </div>

        <div className="p-4 md:p-8 pt-16 md:pt-8">
          {/* Breadcrumb Navigation */}
          <div className="hidden md:flex items-center text-sm text-muted-foreground mb-8">
            <Home className="h-3.5 w-3.5 mr-1" />
            <span className="mx-1 text-white">Dashboard</span>
            <ChevronRight className="h-3.5 w-3.5 mx-1 text-muted-foreground/50" />
            <span className="mx-1 capitalize text-white font-medium text-foreground">{activeSection.replace("-", " ")}</span>
          </div>

          {/* Content area with animated transitions */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30, duration: 0.4 }}
              className="pb-12 relative"
            >
              {/* Background decoration */}
              <div className="absolute -right-32 top-32 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -left-32 bottom-32 w-64 h-64 bg-secondary/5 rounded-full blur-3xl pointer-events-none" />

              {/* Main content with skeleton loader */}
              <Suspense fallback={<SkeletonLoader />}>
                <motion.div
                  className="relative z-10 bg-background/30 backdrop-blur-sm rounded-xl border border-white/10 shadow-xl"
                  whileHover={{ boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
                  transition={{ duration: 0.5 }}
                >
                  {renderContent()}
                </motion.div>
              </Suspense>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
