import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, Menu, Home, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import Sidebar from "@/components/dashboard/Sidebar";
import BillingSection from "@/components/dashboard/BillingSection";
import SettingsSection from "@/components/dashboard/SettingsSection";
import { DashboardSection } from "@/types";
import ProjectsSection from "@/components/dashboard/ProjectsSection";

const Dashboard = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState<DashboardSection>('projects');
  const { user, logout } = useAuth();

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (!user?.name) return 'U';
    return user.name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Render the appropriate content based on active section
  const renderContent = () => {
    switch (activeSection) {
      case 'billing':
        return <BillingSection />;
      case 'projects':
        return <ProjectsSection />;
      case 'settings':
        return <SettingsSection user={user} />;
      default:
        return <ProjectsSection />;
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar
        isSidebarCollapsed={isSidebarCollapsed}
        setIsSidebarCollapsed={setIsSidebarCollapsed}
        activeSection={activeSection}
        setActiveSection={(section: DashboardSection) => {
          setActiveSection(section)
        }}
        user={user ? { ...user, avatarUrl: user.avatarUrl || '' } : null}
        logout={logout}
      />
      
      {/* Main content */}
      <div className="flex-1 p-4 md:p-8">
        {/* Top navigation bar for mobile/tablet */}
        <div className="md:hidden flex items-center justify-between mb-6 bg-background/80 backdrop-blur-sm sticky top-0 z-10 p-2 border-b border-border/40">
          <Button variant="ghost" size="sm" className="p-1.5">
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="p-1.5">
              <Bell className="h-5 w-5" />
            </Button>
            <Avatar className="h-8 w-8">
              <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || user?.email || 'User'}`} />
              <AvatarFallback>{getUserInitials()}</AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* Breadcrumb navigation */}
        <div className="hidden md:flex items-center text-sm text-muted-foreground mb-6">
          <Home className="h-3.5 w-3.5 mr-1" />
          <span className="mx-1">Dashboard</span>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <span className="text-foreground capitalize text-white">{activeSection.replace('-', ' ')}</span>
        </div>

        {/* Main content area */}
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="pb-12"
        >
          {renderContent()}
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;