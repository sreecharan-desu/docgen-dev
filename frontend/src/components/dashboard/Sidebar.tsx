import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { motion } from "framer-motion";
import { Key, CreditCard, FolderKanban, Settings, LogOut, ChevronRight, HelpCircle } from "lucide-react";
import { User } from "@/types";

interface SidebarProps {
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean) => void;
  activeSection: string;
  setActiveSection: (section: string) => void;
  user: User | null;
  logout: () => void;
}

const Sidebar = ({
  isSidebarCollapsed,
  setIsSidebarCollapsed,
  activeSection,
  setActiveSection,
  user,
  logout
}: SidebarProps) => {
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

  return (
    <motion.div 
      className={`${isSidebarCollapsed ? 'w-16' : 'w-64'} border-r border-border/60 h-screen sticky top-0 flex flex-col transition-all duration-300`}
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Toggle sidebar button */}
      <button 
        className="absolute -right-3 top-20 bg-background border border-border/60 rounded-full p-1 shadow-sm z-10"
        onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      >
        <ChevronRight className={`h-4 w-4 transition-transform duration-300 ${isSidebarCollapsed ? 'rotate-180' : ''}`} />
      </button>

      {/* User profile section */}
      <div className={`p-4 border-b border-border/60 ${isSidebarCollapsed ? 'flex justify-center' : ''}`}>
        <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'space-x-3'} mb-4`}>
          <motion.div whileHover={{ scale: 1.1 }} transition={{ duration: 0.2 }}>
            <Avatar className="h-10 w-10 ring-2 ring-primary/20 ring-offset-2 ring-offset-background">
              <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || user?.email || 'User'}`} />
              <AvatarFallback>{getUserInitials()}</AvatarFallback>
            </Avatar>
          </motion.div>
          {!isSidebarCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email || 'No email'}</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={activeSection === 'api-keys' ? 'secondary' : 'ghost'}
                className={`${isSidebarCollapsed ? 'justify-center w-full px-0' : 'justify-start w-full'} relative overflow-hidden group ${activeSection === 'api-keys' ? 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/40' : ''}`}
                onClick={() => setActiveSection('api-keys')}
              >
                <span className="absolute inset-0 w-full h-full bg-green-500/10 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></span>
                <span className="relative flex items-center">
                  <Key className={`h-4 w-4 ${isSidebarCollapsed ? '' : 'mr-2'} ${activeSection === 'api-keys' ? 'text-green-600 dark:text-green-400' : ''}`} />
                  {!isSidebarCollapsed && "API Keys"}
                </span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Manage API Keys</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={activeSection === 'billing' ? 'secondary' : 'ghost'}
                className={`${isSidebarCollapsed ? 'justify-center w-full px-0' : 'justify-start w-full'} relative overflow-hidden group ${activeSection === 'billing' ? 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/40' : ''}`}
                onClick={() => setActiveSection('billing')}
              >
                <span className="absolute inset-0 w-full h-full bg-green-500/10 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></span>
                <span className="relative flex items-center">
                  <CreditCard className={`h-4 w-4 ${isSidebarCollapsed ? '' : 'mr-2'} ${activeSection === 'billing' ? 'text-green-600 dark:text-green-400' : ''}`} />
                  {!isSidebarCollapsed && "Billing"}
                </span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Manage Billing</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={activeSection === 'projects' ? 'secondary' : 'ghost'}
                className={`${isSidebarCollapsed ? 'justify-center w-full px-0' : 'justify-start w-full'} relative overflow-hidden group ${activeSection === 'projects' ? 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/40' : ''}`}
                onClick={() => setActiveSection('projects')}
              >
                <span className="absolute inset-0 w-full h-full bg-green-500/10 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></span>
                <span className="relative flex items-center">
                  <FolderKanban className={`h-4 w-4 ${isSidebarCollapsed ? '' : 'mr-2'} ${activeSection === 'projects' ? 'text-green-600 dark:text-green-400' : ''}`} />
                  {!isSidebarCollapsed && "Projects"}
                </span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Manage Projects</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={activeSection === 'settings' ? 'secondary' : 'ghost'}
                className={`${isSidebarCollapsed ? 'justify-center w-full px-0' : 'justify-start w-full'} relative overflow-hidden group ${activeSection === 'settings' ? 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/40' : ''}`}
                onClick={() => setActiveSection('settings')}
              >
                <span className="absolute inset-0 w-full h-full bg-green-500/10 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></span>
                <span className="relative flex items-center">
                  <Settings className={`h-4 w-4 ${isSidebarCollapsed ? '' : 'mr-2'} ${activeSection === 'settings' ? 'text-green-600 dark:text-green-400' : ''}`} />
                  {!isSidebarCollapsed && "Settings"}
                </span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Account Settings</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </nav>
      
      {/* Help & Logout buttons */}
      <div className={`p-4 border-t border-border/60 ${isSidebarCollapsed ? 'space-y-2' : ''}`}>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                className={`${isSidebarCollapsed ? 'justify-center w-full px-0' : 'justify-start w-full'} text-muted-foreground hover:text-foreground group`}
                onClick={() => window.open('https://docs.example.com', '_blank')}
              >
                <HelpCircle className={`h-4 w-4 ${isSidebarCollapsed ? '' : 'mr-2'} group-hover:text-primary transition-colors`} />
                {!isSidebarCollapsed && "Help & Support"}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Get Help & Support</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                className={`${isSidebarCollapsed ? 'justify-center w-full px-0 mt-2' : 'justify-start w-full mt-1'} text-muted-foreground hover:text-destructive group`}
                onClick={logout}
              >
                <LogOut className={`h-4 w-4 ${isSidebarCollapsed ? '' : 'mr-2'} group-hover:text-destructive transition-colors`} />
                {!isSidebarCollapsed && "Logout"}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Logout from account</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </motion.div>
  );
};

export default Sidebar; 