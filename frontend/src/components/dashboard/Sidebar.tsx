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
    expanded: { width: 240, transition: { duration: 0.2 } },
    collapsed: { width: 64, transition: { duration: 0.2 } },
  };

  const togglerVariants = {
    rotate: (isCollapsed) => ({ rotate: isCollapsed ? 180 : 0 }),
  };

  const UserSkeleton = () => (
    <div className="animate-pulse flex flex-col items-center">
      <div className="h-10 w-10 rounded-full bg-slate-700/50 mb-2"></div>
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
        className={`w-full ${isCollapsed ? "justify-center px-2" : "justify-start px-3"
          } relative h-10 ${isActive
            ? "bg-gradient-to-r from-[#00ff9d]/10 to-transparent text-[#00ff9d] font-medium"
            : "hover:bg-white/5"
          }`}
      >
        <div
          className={`absolute left-0 top-0 bottom-0 w-1 bg-[#00ff9d] rounded-r-full ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-50"
            }`}
        />

        <div className={`flex items-center justify-center ${isActive ? "text-[#00ff9d]" : "text-gray-400"
          }`}>
          <item.icon className={`h-4 w-4 ${isCollapsed ? "" : "mr-3"}`} />
        </div>

        {!isCollapsed && (
          <span className="truncate">
            {item.label}
          </span>
        )}


      </Button>
    </Link>
  );

  return (
    <motion.div
      className="border-r border-slate-600/40 h-screen sticky top-0 flex flex-col bg-[#0d1117] backdrop-blur-md z-20 shadow-lg shadow-black/20"
      initial="expanded"
      animate={isCollapsed ? "collapsed" : "expanded"}
      variants={sidebarVariants}
    >
      {/* Sidebar Toggle Button */}
      <motion.button
        className="absolute -right-3 top-1/2 transform -translate-y-1/2 bg-[#111627] border border-slate-700/80 rounded-full p-1.5 shadow-md z-30 text-slate-400 hover:text-[#00ff9d]"
        onClick={() => setIsCollapsed(!isCollapsed)}
        variants={togglerVariants}
        custom={isCollapsed}
        animate="rotate"
      >
        <ChevronRight className="h-4 w-4" />
      </motion.button>

      {/* Logo Section */}
      <Link to="/" className="flex items-center gap-3 px-4 py-4 border-b border-slate-800/40 group transition-all duration-300 hover:bg-slate-800/20">
        <div className="h-12 w-12 flex-shrink-0 relative -ml-2">
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-teal-500/20 to-blue-500/20 rounded-md opacity-0 group-hover:opacity-100 blur-sm"
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          />
          <motion.img
            src="/docgen-logo.png"
            alt="DocGen Logo"
            className="h-12 w-12  object-contain relative z-10"
            whileHover={{
              scale: 1.05,
              transition: { type: "spring", stiffness: 400, damping: 10 }
            }}
          />
        </div>

        {!isCollapsed && (
          <motion.div
            className="flex flex-col"
            initial={{ x: 0 }}
            whileHover={{ x: 2 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <span className="-mt-2 font-bold text-xl text-white tracking-tight group-hover:text-teal-400 transition-colors duration-300">
              DocGen
            </span>
         
          </motion.div>
        )}
      </Link>

      {/* User Avatar Section with Skeleton */}
      <div className="p-3 border-b border-slate-800/40 flex flex-col items-center">
        {isLoading ? (
          <UserSkeleton />
        ) : (
          <>
            <Avatar className="h-10 w-10 ring-1 ring-[#00ff9d]/30 ring-offset-1 ring-offset-[#0a0d19]">
              <AvatarImage
                src={user?.avatarUrl || ""}
                alt={user?.name || "User"}
              />
              <AvatarFallback className="bg-gradient-to-br from-[#00ff9d] to-[#00e88d] text-[#0a0d19] font-semibold">
                {getUserInitials()}
              </AvatarFallback>
            </Avatar>

            {!isCollapsed && (
              <div className="text-center mt-2 w-full">
                <p className="font-medium text-sm text-white">
                  {user?.name || "User"}
                </p>
                <p className="text-xs text-gray-400 truncate mt-0.5"
                  title={user?.email}>
                  {user?.email || "user@example.com"}
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Sidebar Navigation */}
      <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
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
                  className="bg-[#111627] text-white border-slate-700 shadow-md p-2"
                >
                  <span className="text-sm">{item.label}</span>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        ))}
      </nav>

      {/* Subtle Divider */}
      <div className="mx-3 my-2">
        <div className="h-px bg-slate-700/50" />
      </div>

      {/* Footer Actions */}
      <div className="p-2 space-y-1">
        {footerItems.map((item) => (
          <TooltipProvider key={item.id} delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  key={item.id}
                  variant="ghost"
                  className={`w-full ${isCollapsed ? "justify-center px-2" : "justify-start px-3"
                    } h-10 ${item.danger
                      ? "hover:bg-red-900/20 hover:text-red-400"
                      : "hover:bg-white/5"
                    }`}
                  onClick={item.action}
                >
                  <div className={`flex items-center justify-center ${item.danger ? "text-red-400/80" : "text-gray-400"
                    }`}>
                    <item.icon className={`h-4 w-4 ${isCollapsed ? "" : "mr-3"}`} />
                  </div>
                  {!isCollapsed && <span>{item.label}</span>}
                </Button>
              </TooltipTrigger>
              {isCollapsed && (
                <TooltipContent
                  side="right"
                  className="bg-[#111627] text-white border-slate-700 shadow-md p-2"
                >
                  <span className={`text-sm ${item.danger ? "text-red-400" : ""}`}>
                    {item.label}
                  </span>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>

      {/* Version Tag */}
      {!isCollapsed && (
        <div className="p-3 text-center">
          <span className="text-xs text-gray-500">v1.0.0</span>
        </div>
      )}
    </motion.div>
  );
};

export default Sidebar;