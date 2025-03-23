import { useState, useEffect } from "react";
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
  Home,
} from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeItem, setActiveItem] = useState("");

  useEffect(() => {
    if (
      user != null &&
      (localStorage.getItem("token") == null ||
        localStorage.getItem("token") === undefined)
    ) {
      navigate("/");
    }

    // Auto-collapse sidebar on repo pages
    if (window.location.pathname.startsWith("/repo")) {
      setIsCollapsed(true);
    }

    // Set active item based on current path
    const currentPath = location.pathname;
    const currentItem = navItems.find(item => 
      currentPath === item.path || currentPath.startsWith(`${item.path}/`)
    );
    
    if (currentItem) {
      setActiveItem(currentItem.id);
    }

    setIsLoading(user === null || user === undefined);
  }, [user, navigate, location]);

  const getUserInitials = () => {
    if (!user?.name) return "U";
    return user.name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const navItems = [
    { 
      id: "home", 
      label: "Dashboard", 
      icon: Home, 
      path: "/dashboard",
      description: "View your dashboard"
    },
    // {
    //   id: "projects",
    //   label: "Projects",
    //   icon: FolderKanban,
    //   path: "/projects",
    //   description: "Manage your projects"
    // },
    { 
      id: "pricing", 
      label: "Pricing", 
      icon: CreditCard, 
      path: "/pricing",
      description: "Subscription plans" 
    },
    { 
      id: "settings", 
      label: "Settings", 
      icon: Settings, 
      path: "/settings",
      description: "Account settings" 
    },
    { 
      id: "docs", 
      label: "Documentation", 
      icon: LinkIcon, 
      path: "/docs",
      description: "Product guides" 
    },
  ];

  const footerItems = [
    {
      id: "help",
      label: "Help & Support",
      icon: HelpCircle,
      action: () => navigate("/docs"),
      description: "Get assistance"
    },
    {
      id: "logout",
      label: "Logout",
      icon: LogOut,
      action: logout,
      danger: true,
      description: "Sign out of account"
    },
  ];

  const sidebarVariants = {
    expanded: { width: 260, transition: { duration: 0.3, ease: "easeInOut" } },
    collapsed: { width: 72, transition: { duration: 0.3, ease: "easeInOut" } },
  };

  const togglerVariants = {
    initial: { rotate: 0 },
    hover: { scale: 1.1, boxShadow: "0 0 10px rgba(0, 255, 157, 0.3)" },
    rotate: (isCollapsed) => ({ rotate: isCollapsed ? 180 : 0 }),
  };

  const UserSkeleton = () => (
    <div className="animate-pulse flex flex-col items-center">
      <div className="h-12 w-12 rounded-full bg-slate-700/50 mb-2"></div>
      {!isCollapsed && (
        <>
          <div className="h-4 w-24 bg-slate-700/40 rounded mb-2"></div>
          <div className="h-3 w-20 bg-slate-700/30 rounded"></div>
        </>
      )}
    </div>
  );

  const NavItem = ({ item, isActive }) => (
    <Link to={item.path} className="w-full">
      <Button
        variant="ghost"
        className={`w-full ${
          isCollapsed ? "justify-center px-2" : "justify-start px-3"
        } relative h-11 group transition-all duration-200 ${
          isActive 
            ? "bg-gradient-to-r from-[#00ff9d]/10 to-transparent text-[#00ff9d] font-medium" 
            : "hover:bg-white/5"
        }`}
      >
        <motion.div
          className={`absolute left-0 top-0 bottom-0 w-1 bg-[#00ff9d] rounded-r-full ${
            isActive ? "opacity-100" : "opacity-0 group-hover:opacity-50"
          }`}
          initial={{ height: 0 }}
          animate={{ height: isActive ? "100%" : "30%" }}
          transition={{ duration: 0.2 }}
        />
        
        <motion.div 
          className={`flex items-center justify-center rounded-lg ${
            isActive ? "text-[#00ff9d]" : "text-gray-400 group-hover:text-white"
          }`}
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <item.icon className={`h-4.5 w-4.5 ${isCollapsed ? "" : "mr-3"}`} />
        </motion.div>
        
        {!isCollapsed && (
          <span className={`truncate ${isActive ? "" : "group-hover:text-white"}`}>
            {item.label}
          </span>
        )}
        
        {isActive && !isCollapsed && (
          <motion.div 
            className="ml-auto text-xs font-normal text-[#00ff9d]/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            active
          </motion.div>
        )}
      </Button>
    </Link>
  );

  return (
    <motion.div
      className="border-r border-slate-800/40 h-screen sticky top-0 flex flex-col bg-[#0d1117] backdrop-blur-md z-20 shadow-lg shadow-black/20"
      initial="expanded"
      animate={isCollapsed ? "collapsed" : "expanded"}
      variants={sidebarVariants}
    >
      {/* Sidebar Toggle Button */}
      <motion.button
        className="absolute -right-3 top-20 bg-[#111627] border border-slate-700/80 rounded-full p-1.5 shadow-md z-30 text-slate-400 hover:text-[#00ff9d]"
        onClick={() => setIsCollapsed(!isCollapsed)}
        variants={togglerVariants}
        custom={isCollapsed}
        animate={["rotate", "initial"]}
        whileHover="hover"
        whileTap={{ scale: 0.9 }}
      >
        <ChevronRight className="h-4 w-4" />
        <span className="absolute inset-0 rounded-full bg-[#00ff9d]/5 opacity-0 hover:opacity-100 transition-opacity duration-300"></span>
      </motion.button>

      {/* Logo Section */}
      <Link to="/" className="flex items-center gap-2 px-4 py-5 border-b border-slate-800/40">
        <motion.div
          className="relative h-10 w-10 flex-shrink-0"
          whileHover={{ 
            scale: 1.1,
            transition: { duration: 0.3, type: "spring", stiffness: 400 }
          }}
        >
          <motion.img
            src="/docgen-logo.png"
            alt="DocGen Logo"
            className="h-10 w-10 object-contain"
          />
          <motion.div 
            className="absolute -inset-1 rounded-full bg-[#00ff9d]/5 opacity-0"
            whileHover={{ opacity: 1, scale: 1.2 }}
            transition={{ duration: 0.3 }}
          />
        </motion.div>
        
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col"
            >
              <motion.span 
                className="font-bold text-lg text-white tracking-tight"
                whileHover={{ x: 2 }}
              >
                DocGen
              </motion.span>
              <motion.span className="text-xs text-gray-400 -mt-1">
                Documentation AI
              </motion.span>
            </motion.div>
          )}
        </AnimatePresence>
      </Link>

      {/* User Avatar Section with Skeleton */}
      <motion.div 
        className="p-4 border-b border-slate-800/40 flex flex-col items-center"
        layout
      >
        {isLoading ? (
          <UserSkeleton />
        ) : (
          <>
            <motion.div
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Avatar className="h-12 w-12 ring-2 ring-[#00ff9d]/30 ring-offset-2 ring-offset-[#0a0d19] shadow-lg shadow-[#00ff9d]/10">
                <AvatarImage
                  src={user?.avatarUrl || ""}
                  alt={user?.name || "User"}
                />
                <AvatarFallback className="bg-gradient-to-br from-[#00ff9d] to-[#00e88d] text-[#0a0d19] font-semibold">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
            </motion.div>
            
            <AnimatePresence>
              {!isCollapsed && (
                <motion.div 
                  className="text-center mt-3 w-full"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  <motion.p 
                    className="font-medium text-white"
                    whileHover={{ color: "#00ff9d" }}
                  >
                    {user?.name || "User"}
                  </motion.p>
                  <motion.p 
                    className="text-xs text-gray-400 truncate mt-0.5"
                    title={user?.email}
                  >
                    {user?.email || "user@example.com"}
                  </motion.p>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </motion.div>

      {/* Sidebar Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
        {navItems.map((item) => (
          <TooltipProvider key={item.id} delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <NavItem item={item} isActive={activeItem === item.id} />
                </div>
              </TooltipTrigger>
              {isCollapsed && (
                <TooltipContent
                  side="right"
                  className="bg-[#111627] text-white border-slate-700 shadow-xl p-3"
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{item.label}</span>
                    <span className="text-xs text-gray-400 mt-1">{item.description}</span>
                  </div>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        ))}
      </nav>

      {/* Subtle Divider */}
      <div className="mx-3 my-2">
        <div className="h-px bg-gradient-to-r from-transparent via-slate-700/50 to-transparent" />
      </div>

      {/* Footer Actions */}
      <div className="p-3 space-y-1">
        {footerItems.map((item) => (
          <TooltipProvider key={item.id} delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  key={item.id}
                  variant="ghost"
                  className={`w-full ${
                    isCollapsed ? "justify-center px-2" : "justify-start px-3"
                  } h-11 group transition-all duration-200 ${
                    item.danger 
                      ? "hover:bg-red-900/20 hover:text-red-400" 
                      : "hover:bg-white/5"
                  }`}
                  onClick={item.action}
                >
                  <motion.div 
                    className={`flex items-center justify-center rounded-lg ${
                      item.danger ? "text-red-400/80" : "text-gray-400"
                    } group-hover:${item.danger ? "text-red-400" : "text-white"}`}
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <item.icon className={`h-4.5 w-4.5 ${isCollapsed ? "" : "mr-3"}`} />
                  </motion.div>
                  {!isCollapsed && <span>{item.label}</span>}
                </Button>
              </TooltipTrigger>
              {isCollapsed && (
                <TooltipContent
                  side="right"
                  className={`${
                    item.danger 
                      ? "bg-[#111627] border-red-900/30" 
                      : "bg-[#111627] border-slate-700"
                  } text-white shadow-xl p-3`}
                >
                  <div className="flex flex-col">
                    <span className={`font-medium ${item.danger ? "text-red-400" : ""}`}>
                      {item.label}
                    </span>
                    <span className="text-xs text-gray-400 mt-1">{item.description}</span>
                  </div>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>

      {/* Version Tag */}
      {!isCollapsed && (
        <div className="p-4 text-center">
          <span className="text-xs text-gray-500">v1.2.0</span>
        </div>
      )}
    </motion.div>
  );
};

export default Sidebar;