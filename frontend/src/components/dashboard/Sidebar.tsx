import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { motion } from "framer-motion";
import {
  FolderKanban,
  CreditCard,
  Settings,
  LogOut,
  ChevronRight,
  HelpCircle,
  Link as LinkIcon,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext" // Assuming correct path

const Sidebar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth(); // Get user and logout from AuthContext
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  // Redirect to home if user is logged in but no token exists
  useEffect(() => {
    if (user != null && (localStorage.getItem('token') == null || localStorage.getItem("token") === undefined)) {
      navigate('/');
    }
  }, [user, navigate]); // Dependencies: user and navigate

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
    { id: "projects", label: "Projects", icon: FolderKanban, path: "/projects" },
    { id: "pricing", label: "Pricing", icon: CreditCard, path: "/pricing" },
    { id: "settings", label: "Settings", icon: Settings, path: "/settings" },
    { id: "docs", label: "Docs", icon: LinkIcon, path: "/docs" },
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

  const togglerVariants = {
    initial: { rotate: 0 },
    hover: { scale: 1.1 },
    rotate: (isCollapsed: boolean) => ({ rotate: isCollapsed ? 180 : 0 }),
  };

  return (
    <motion.div
      className="border-r border-slate-200/20 dark:border-slate-800/40 h-screen sticky top-0 flex flex-col bg-white/5 dark:bg-slate-900/50 backdrop-blur-sm z-20"
      initial="expanded"
      animate={isCollapsed ? "collapsed" : "expanded"}
      variants={sidebarVariants}
    >
      {/* Sidebar Toggle Button */}
      <motion.button
        className="absolute -right-3 top-20 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-full p-1.5 shadow-md z-30"
        onClick={() => setIsCollapsed(!isCollapsed)}
        variants={togglerVariants}
        custom={isCollapsed}
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
        {!isCollapsed && (
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
        {!isCollapsed && (
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
                <Link to={item.path}>
                  <Button
                    variant="ghost"
                    className={`w-full ${isCollapsed ? "justify-center px-0" : "justify-start"} relative h-10`}
                  >
                    <item.icon
                      className={`h-4 w-4 ${isCollapsed ? "" : "mr-3"}`}
                    />
                    {!isCollapsed && <span>{item.label}</span>}
                  </Button>
                </Link>
              </TooltipTrigger>
              {isCollapsed && (
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
            {!isCollapsed && <span>{item.label}</span>}
          </Button>
        ))}
      </div>
    </motion.div>
  );
};

export default Sidebar;