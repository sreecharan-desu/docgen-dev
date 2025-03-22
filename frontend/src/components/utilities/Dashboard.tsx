import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, Menu, Home, ChevronRight } from "lucide-react";
import { useState, Suspense, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import BillingSection from "@/components/dashboard/BillingSection";
import SettingsSection from "@/components/dashboard/SettingsSection";
import ProjectsSection from "@/pages/projectsSection/ProjectsSection";
import { useNavigate } from "react-router-dom";

// Skeleton loader component
const SkeletonLoader = () => (
  <div className="flex flex-col space-y-4">
    <div className="h-12 bg-muted-foreground/10 rounded-md"></div>
    <div className="h-24 bg-muted-foreground/10 rounded-md"></div>
    <div className="h-40 bg-muted-foreground/10 rounded-md"></div>
  </div>
);

const Dashboard = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState("projects");
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const location = window.location.pathname;
    if (location === "/dashboard" && localStorage.getItem("token") == undefined) {
      setTimeout(() => navigate("/"), 2000);
    }
  }, []);

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
        return null;
      default:
        return <ProjectsSection />;
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Main content */}
      <div className="flex-1 relative">
        {/* Top navigation bar */}
        <div className="md:hidden flex items-center justify-between mb-6 bg-background/95 fixed top-0 left-0 right-0 z-10 px-4 py-3">
          <Button variant="ghost" size="sm" className="p-1.5">
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" className="p-1.5 relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
            </Button>
            <Avatar className="h-8 w-8 ring-1 ring-muted">
              <AvatarImage
                src={`https://api.dicebear.com/7.x/initials/svg?seed=${
                  user?.name || user?.email || "User"
                }`}
              />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {getUserInitials()}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        <div className="p-4 md:p-8 pt-16 md:pt-8">
          {/* Content area */}
          <div className="pb-12 relative">
            {/* Main content with skeleton loader */}
            <Suspense fallback={<SkeletonLoader />}>
              <div className="relative z-10 bg-background rounded-lg shadow-md">
                {renderContent()}
              </div>
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
