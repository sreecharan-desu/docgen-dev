import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { motion, AnimatePresence } from "framer-motion";
import {
  FolderKanban,
  CreditCard,
  Settings,
  LogOut,
  ChevronRight,
  HelpCircle,
  Link as LinkIcon,
} from "lucide-react";
import { User as UserType } from "@/types";
import { Link, useNavigate } from "react-router-dom";

// Sidebar Props
interface SidebarProps {
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean) => void;
  activeSection: string;
  setActiveSection: (section: string) => void;
  user: UserType | null;
  logout: () => void;
}

const Sidebar = ({
  isSidebarCollapsed,
  setIsSidebarCollapsed,
  activeSection,
  setActiveSection,
  user,
  logout,
}: SidebarProps) => {
  const navigate = useNavigate();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  // Extracts user initials for AvatarFallback
  const getUserInitials = () => {
    if (!user?.name) return "U";
    return user.name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Sidebar navigation items
  const navItems = [
    { id: "projects", label: "Projects", icon: FolderKanban },
    { id: "pricing", label: "Pricing", icon: CreditCard },
    { id: "settings", label: "Settings", icon: Settings },
    { id: "docs", label: "Docs", icon: LinkIcon },
  ];

  // Footer action items
  const footerItems = [
    {
      id: "help",
      label: "Help & Support",
      icon: HelpCircle,
      action: () => navigate("/docs"),
    },
    {
      id: "logout",
      label: "Logout",
      icon: LogOut,
      action: logout,
      danger: true,
    },
  ];

  // Sidebar Animation Variants
  const sidebarVariants = {
    expanded: { width: 240, transition: { duration: 0.3, ease: "easeInOut" } },
    collapsed: { width: 72, transition: { duration: 0.3, ease: "easeInOut" } },
  };

  const iconVariants = {
    collapsed: { scale: 1.15 },
    expanded: { scale: 1 },
  };

  const textVariants = {
    collapsed: { opacity: 0, display: "none" },
    expanded: { opacity: 1, display: "block", transition: { delay: 0.1 } },
  };

  const togglerVariants = {
    initial: { rotate: 0 },
    hover: { scale: 1.1 },
    rotate: (isCollapsed: boolean) => ({ rotate: isCollapsed ? 180 : 0 }),
  };

  const handleItemClick = (id: string) => {
    setActiveSection(id);
  };

  return (
    <motion.div
      className="border-r border-slate-200/20 dark:border-slate-800/40 h-screen sticky top-0 flex flex-col bg-white/5 dark:bg-slate-900/50 backdrop-blur-sm z-20"
      initial="collapsed"
      animate={isSidebarCollapsed ? "collapsed" : "expanded"}
      variants={sidebarVariants}
    >
      {/* Sidebar Toggle Button */}
      <motion.button
        className="absolute -right-3 top-20 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-full p-1.5 shadow-md z-30"
        onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        variants={togglerVariants}
        custom={isSidebarCollapsed}
        animate={["rotate", "initial"]}
        whileHover="hover"
        whileTap={{ scale: 0.9 }}
      >
        <ChevronRight className="h-4 w-4 text-slate-600 dark:text-slate-400" />
      </motion.button>

      {/* Logo Section */}
      <Link to="/" className="flex items-center gap-2 p-4">
        <motion.img
          src="/docgen-logo.png"
          alt="DocGen Logo"
          className="h-10 w-10"
          whileHover={{ scale: 1.15, transition: { duration: 0.5 } }}
        />
        {!isSidebarCollapsed && (
          <motion.span
            className="font-semibold text-lg text-white"
            whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
          >
            DocGen
          </motion.span>
        )}
      </Link>

      {/* User Avatar */}
      <motion.div className="p-4 border-b border-slate-200/20 dark:border-slate-800/40 flex flex-col items-center">
        <Avatar className="h-12 w-12 ring-2 ring-primary/20 ring-offset-2 ring-offset-background text-white">
          <AvatarImage src={user?.avatarUrl || ""} alt={user?.name || "User"} />
          <AvatarFallback className="bg-gradient-to-br from-primary/80 to-primary/30 text-white">
            {getUserInitials()}
          </AvatarFallback>
        </Avatar>
        {!isSidebarCollapsed && (
          <motion.div className="text-center mt-2">
            <p className="font-medium dark:text-slate-200">
              {user?.name || "User"}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {user?.email || "No email"}
            </p>
          </motion.div>
        )}
      </motion.div>

      {/* Sidebar Navigation */}
      <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => (
          <TooltipProvider key={item.id}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  className={`w-full ${isSidebarCollapsed ? "justify-center px-0" : "justify-start"} relative h-10`}
                  onClick={() => handleItemClick(item.id)}
                >
                  <item.icon
                    className={`h-4 w-4 ${isSidebarCollapsed ? "" : "mr-3"}`}
                  />
                  {!isSidebarCollapsed && <span>{item.label}</span>}
                </Button>
              </TooltipTrigger>
              {isSidebarCollapsed && (
                <TooltipContent
                  side="right"
                  className="bg-slate-900 text-white border-slate-700"
                >
                  {item.label}
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        ))}
      </nav>

      {/* Footer Actions */}
      <div className="p-3 border-t border-slate-200/20 dark:border-slate-800/40 space-y-1.5">
        {footerItems.map((item) => (
          <Button
            key={item.id}
            variant="ghost"
            className="w-full justify-start h-10"
            onClick={item.action}
          >
            <item.icon className="h-4 w-4 mr-3" />
            {!isSidebarCollapsed && <span>{item.label}</span>}
          </Button>
        ))}
      </div>
    </motion.div>
  );
};

export default Sidebar;
