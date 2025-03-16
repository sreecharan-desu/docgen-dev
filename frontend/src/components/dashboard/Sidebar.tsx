import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { motion, AnimatePresence } from "framer-motion";
import { FolderKanban, CreditCard, Settings, LogOut, ChevronRight, HelpCircle, Link as LinkIcon } from "lucide-react";
import { User as UserType } from "@/types";
import { useNavigate } from "react-router-dom";

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
  logout
}: SidebarProps) => {
  const navigate = useNavigate();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user?.name) return 'U';
    return user.name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Navigation items
  const navItems = [
    { id: 'projects', label: 'Projects', icon: FolderKanban },
    { id: 'pricing', label: 'Pricing', icon: CreditCard },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'docs', label: 'Docs', icon: LinkIcon }
  ];

  // Footer items
  const footerItems = [
    { id: 'help', label: 'Help & Support', icon: HelpCircle, action: () => navigate('/docs') },
    { id: 'logout', label: 'Logout', icon: LogOut, action: logout, danger: true },
  ];

  // Animation variants
  const sidebarVariants = {
    expanded: { width: 240, transition: { duration: 0.3, ease: "easeInOut" } },
    collapsed: { width: 72, transition: { duration: 0.3, ease: "easeInOut" } }
  };

  const iconVariants = {
    collapsed: { scale: 1.15 },
    expanded: { scale: 1 }
  };

  const textVariants = {
    collapsed: { opacity: 0, display: "none" },
    expanded: { opacity: 1, display: "block", transition: { delay: 0.1 } }
  };

  const handleItemClick = (id: string) => {
    setActiveSection(id);
    // Optional: Close sidebar on mobile after selection
    // if (window.innerWidth < 768) setIsSidebarCollapsed(true);
  };

  const avatarVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.1, transition: { duration: 0.2 } }
  };

  const togglerVariants = {
    initial: { scale: 1, rotate: 0 },
    hover: { scale: 1.1, rotate: 0 },
    rotate: (isCollapsed: boolean) => ({ rotate: isCollapsed ? 180 : 0 })
  };

  return (
    <motion.div
      className="border-r border-slate-200/20 dark:border-slate-800/40 h-screen sticky top-0 flex flex-col bg-white/5 dark:bg-slate-900/50 backdrop-blur-sm z-20"
      initial="collapsed"
      animate={isSidebarCollapsed ? "collapsed" : "expanded"}
      variants={sidebarVariants}
    >
      {/* Toggle button */}
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

      {/* User profile */}
      <motion.div
        className="p-4 border-b border-slate-200/20 dark:border-slate-800/40 flex flex-col items-center"
        layout
      >
        <motion.div
          className="relative mb-2"
          variants={avatarVariants}
          initial="initial"
          whileHover="hover"
        >
          <Avatar className="h-12 w-12 ring-2 ring-primary/20 ring-offset-2 ring-offset-background text-white">
            <AvatarImage src={user?.avatarUrl || ''} className="text-white" alt={user?.name || 'User'} />
            <AvatarFallback className="bg-gradient-to-br from-primary/80 to-primary/30 text-white">
              {getUserInitials()}
            </AvatarFallback>
          </Avatar>
          <motion.div
            className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white dark:border-slate-900"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5 }}
          />
        </motion.div>

        <AnimatePresence mode="wait">
          {!isSidebarCollapsed && (
            <motion.div
              className="text-center"
              variants={textVariants}
              initial="collapsed"
              animate="expanded"
              exit="collapsed"
            >
              <motion.p
                className="font-medium dark:text-slate-200 text-white"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {user?.name || 'User'}
              </motion.p>
              <motion.p
                className="text-xs text-slate-500 dark:text-slate-400 truncate"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {user?.email || 'No email'}
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = activeSection === item.id;
          const isHovered = hoveredItem === item.id;

          return (
            <TooltipProvider key={item.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.div
                    className="relative"
                    onHoverStart={() => setHoveredItem(item.id)}
                    onHoverEnd={() => setHoveredItem(null)}
                  >
                    <Button
                      variant="ghost"
                      className={`w-full ${isSidebarCollapsed ? 'justify-center px-0' : 'justify-start'} relative h-10 group bg-transparent hover:border-primary`}
                      onClick={() => handleItemClick(item.id)}
                    >
                      {/* Animated background */}
                      {isActive && (
                        <motion.span
                          className="absolute inset-0 bg-primary/10 dark:bg-primary/20 rounded-md z-0"
                          layoutId="activeBackground"
                          initial={{ borderRadius: 6 }}
                          transition={{ duration: 0.3, type: "spring", stiffness: 400, damping: 30 }}
                        />
                      )}

                      {/* Hover effect */}
                      {!isActive && isHovered && (
                        <motion.span
                          className="absolute inset-0 bg-transparent hover:border-primary rounded-md z-0"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        />
                      )}

                      {/* Icon */}
                      <motion.div
                        className="relative z-10"
                        variants={iconVariants}
                        initial="expanded"
                        animate={isSidebarCollapsed ? "collapsed" : "expanded"}
                      >
                        <item.icon className={`h-4 w-4 ${isSidebarCollapsed ? '' : 'mr-3'} ${isActive ? 'text-primary' : 'text-slate-600 dark:text-slate-400'}`} />
                      </motion.div>

                      {/* Text */}
                      <AnimatePresence mode="wait">
                        {!isSidebarCollapsed && (
                          <motion.span
                            className={`relative z-10 font-medium ${isActive ? 'text-primary' : 'text-white dark:text-slate-300'}`}
                            variants={textVariants}
                            initial="collapsed"
                            animate="expanded"
                            exit="collapsed"
                          >
                            {item.label}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </Button>
                  </motion.div>
                </TooltipTrigger>
                {isSidebarCollapsed && (
                  <TooltipContent side="right" className="bg-slate-900 text-white border-slate-700">
                    <p>{item.label}</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </nav>

      {/* Footer */}
      <motion.div
        className="p-3 border-t border-slate-200/20 dark:border-slate-800/40 space-y-1.5"
        layout
      >
        {footerItems.map((item) => (
          <TooltipProvider key={item.id}>
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.div
                  onHoverStart={() => setHoveredItem(item.id)}
                  onHoverEnd={() => setHoveredItem(null)}
                >
                  <Button
                    variant="ghost"
                    className={`w-full ${isSidebarCollapsed ? 'justify-center px-0' : 'justify-start'} h-10 ${item.danger ? 'hover:dark:bg-primary/20' : 'hover:text-primary'}`}
                    onClick={item.action}
                  >
                    {/* Hover effect */}
                    {hoveredItem === item.id && (
                      <motion.span
                        className={`absolute inset-0 rounded-md z-0 bg-transparent hover:border-primary ${item.danger ? 'dark:bg-primary/20' : ' dark:bg-slate-800/50'}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      />
                    )}

                    {/* Icon */}
                    <motion.div
                      className="relative z-10"
                      variants={iconVariants}
                      initial="expanded"
                      animate={isSidebarCollapsed ? "collapsed" : "expanded"}
                    >
                      <item.icon className={`h-4 w-4 ${isSidebarCollapsed ? '' : 'mr-3'} ${item.danger ? 'text-slate-600 dark:text-slate-400 group-hover:dark:bg-primary/20' : 'text-slate-600 dark:text-slate-400'}`} />
                    </motion.div>

                    {/* Text */}
                    <AnimatePresence mode="wait">
                      {!isSidebarCollapsed && (
                        <motion.span
                          className={`relative z-10 font-medium text-white dark:text-slate-300 ${item.danger ? 'group-hover:dark:bg-primary/20' : ''}`}
                          variants={textVariants}
                          initial="collapsed"
                          animate="expanded"
                          exit="collapsed"
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Button>
                </motion.div>
              </TooltipTrigger>
              {isSidebarCollapsed && (
                <TooltipContent side="right" className="bg-slate-900 text-white border-slate-700">
                  <p>{item.label}</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        ))}
      </motion.div>
    </motion.div>
  );
};

export default Sidebar;