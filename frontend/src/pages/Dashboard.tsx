import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, Menu, Home, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
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
    <div className="flex min-h-screen bg-gradient-to-br from-background to-background/95">
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
      <motion.div 
        className="flex-1 relative overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {/* Top navigation bar for mobile/tablet - Floating style */}
        <motion.div 
          className="md:hidden flex items-center justify-between mb-6 bg-background/80 backdrop-blur-md fixed top-0 left-0 right-0 z-10 px-4 py-3 border-b border-white/10 shadow-sm"
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 20 }}
        >
          <Button variant="ghost" size="sm" className="p-1.5 hover:bg-white/10 transition-all duration-300">
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center space-x-3">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button variant="ghost" size="sm" className="p-1.5 hover:bg-white/10 transition-all duration-300 relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
              </Button>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Avatar className="h-8 w-8 ring-2 ring-white/20 hover:ring-white/40 transition-all duration-300">
                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || user?.email || 'User'}`} />
                <AvatarFallback className="bg-primary/80 text-primary-foreground">{getUserInitials()}</AvatarFallback>
              </Avatar>
            </motion.div>
          </div>
        </motion.div>

        <div className="p-4 md:p-8 pt-16 md:pt-8">
          {/* Breadcrumb navigation */}
          <motion.div 
            className="hidden md:flex items-center text-sm text-muted-foreground mb-8"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            <Home className="h-3.5 w-3.5 mr-1" />
            <span className="mx-1">Dashboard</span>
            <ChevronRight className="h-3.5 w-3.5 mx-1 text-muted-foreground/50" />
            <motion.span 
              className="text-foreground capitalize font-medium"
              key={activeSection}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              {activeSection.replace('-', ' ')}
            </motion.span>
          </motion.div>

          {/* Content area with slick animations */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ 
                type: "spring",
                stiffness: 300,
                damping: 30,
                duration: 0.4
              }}
              className="pb-12 relative"
            >
              {/* Subtle background decoration */}
              <div className="absolute -right-32 top-32 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -left-32 bottom-32 w-64 h-64 bg-secondary/5 rounded-full blur-3xl pointer-events-none" />
              
              {/* Main content with card-like container */}
              <motion.div 
                className="relative z-10 bg-background/30 backdrop-blur-sm rounded-xl border border-white/10 shadow-xl"
                whileHover={{ boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
                transition={{ duration: 0.5 }}
              >
                {renderContent()}
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;