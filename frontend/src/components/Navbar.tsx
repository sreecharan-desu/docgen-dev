import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, LogOut, LayoutDashboard, Github, ChevronRight, ArrowRight, Star } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  console.log("User", user);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Animation variants
  const navbarVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    }
  };

  const menuItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: i => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.3
      }
    })
  };

  return (
    <motion.nav
      className={`fixed top-0 w-full z-50 border-b border-opacity-40 transition-all duration-300 ${scrolled
        ? "bg-background/80 backdrop-blur-lg shadow-lg border-gray-800/30"
        : "bg-background/40 backdrop-blur-md"
        }`}
      variants={navbarVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="container flex h-16 items-center justify-between px-4 mx-auto">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <motion.img
            src="/docgen-logo.png"
            alt="DocGen Logo"
            className="h-10 w-10 transition-transform duration-300"
            whileHover={{
              scale: 1.15,
              rotate: [0, -10, 10, -5, 0],
              transition: { duration: 0.5 }
            }}
          />
          <motion.span
            className="font-semibold text-lg text-white group-hover:text-primary transition duration-300"
            whileHover={{
              scale: 1.05,
              transition: { duration: 0.2 }
            }}
          >
            DocGen
          </motion.span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          <motion.div
            whileHover={{
              scale: 1.03,
              transition: { type: "spring", stiffness: 400, damping: 10 }
            }}
          >
            <Link
              to="/docs"
              className="flex items-center gap-1.5 px-2 py-1 rounded-md text-sm font-medium text-gray-200 hover:text-primary transition-colors duration-200 group"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                className="w-4 h-4 stroke-gray-300 group-hover:stroke-primary transition-colors duration-200"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
              </svg>
              <span>Docs</span>
            </Link>
          </motion.div>

          {user ? (
            <motion.div
              className="relative flex items-center cursor-pointer gap-2 px-2 py-1 rounded-md bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 shadow-sm hover:border-primary/50 transition-all duration-300"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400 }}
              onClick={() => navigate("/dashboard")}
            >
              {/* Avatar with verification indicator */}
              <div className="relative">
                <Avatar className="h-7 w-7 ring-1 ring-primary/30">
                  <AvatarImage src="/user-avatar.png" alt="User Avatar" />
                  <AvatarFallback className="bg-primary/20 text-xs">{user?.name?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                </Avatar>

                {/* Tiny verification dot */}
                {user?.email_confirmed && (
                  <div className="absolute -bottom-0.5 -right-0.5 h-2 w-2 bg-green-500 rounded-full border border-slate-800" />
                )}
              </div>

              {/* Minimal user info */}
              <div className="flex flex-col justify-center">
                <h2 className="text-xs font-medium text-white leading-tight truncate max-w-32">{user?.name || "User"}</h2>
                <p className="text-xs text-gray-400 leading-tight truncate max-w-32">{user?.email || "user"}</p>
              </div>
            </motion.div>
          ) : (
            <div className="flex items-center gap-3">
              <motion.div
                whileHover={{
                  scale: 1.05,
                  transition: { type: "spring", stiffness: 400, damping: 10 }
                }}
                whileTap={{
                  scale: 0.95,
                  transition: { type: "spring", stiffness: 500, damping: 10 }
                }}
                className="relative"
              >
                <Link to="/auth/login">
                  <Button className="relative group overflow-hidden bg-gradient-to-r from-green-700 via-green-600 to-green-800 hover:from-green-600 hover:via-green-500 hover:to-green-700 text-white transition-all duration-500 shadow-lg shadow-primary/30 px-6 py-3 font-medium">
                    {/* Background pulse effect */}
                    <span className="absolute inset-0 bg-gradient-to-tr from-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-sm"></span>

                    {/* Shine effect */}
                    <span className="absolute inset-0 translate-x-full group-hover:translate-x-[-180%] bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 skew-x-12"></span>

                    {/* Border glow effect */}
                    <span className="absolute inset-0 rounded-md border border-primary/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 scale-[1.03] group-hover:scale-105"></span>

                    {/* Star icon and text */}
                    <span className="flex items-center space-x-2 relative z-10">
                      <span className="relative">
                        Join us
                      </span>
                    </span>
                  </Button>
                </Link>

                {/* Outer glow effect */}
                <motion.div
                  className="absolute inset-0 -z-10 rounded-md bg-primary/20 blur-md"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                {/* <Link to="/auth/register">
                  <Button className="bg-primary text-white hover:bg-primary/80 transition duration-300 shadow-md shadow-primary/20">
                    Register
                  </Button>
                </Link> */}
              </motion.div>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <motion.div
          className="md:hidden flex items-center"
          whileTap={{ scale: 0.9 }}
        >
          <Button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            variant="ghost"
            size="sm"
            className="bg-slate-800/30 hover:bg-slate-700/50 text-white rounded-lg p-2"
          >
            <motion.div
              animate={{ rotate: isMobileMenuOpen ? 90 : 0 }}
              transition={{ duration: 0.3, type: "spring", stiffness: 260 }}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </motion.div>
          </Button>
        </motion.div>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="md:hidden border-t border-gray-800/30 bg-slate-900/90 backdrop-blur-lg shadow-lg"
            initial={{ opacity: 0, height: 0 }}
            animate={{
              opacity: 1,
              height: "auto",
              transition: {
                duration: 0.4,
                ease: "easeInOut"
              }
            }}
            exit={{
              opacity: 0,
              height: 0,
              transition: {
                duration: 0.3,
                ease: "easeInOut"
              }
            }}
          >
            <div className="py-4 px-6 space-y-1">
              <motion.div
                whileHover={{
                  scale: 1.03,
                  transition: { type: "spring", stiffness: 400, damping: 10 }
                }}
              >
                <Link
                  to="/docs"
                  className="flex items-center gap-1.5 px-2 py-1 rounded-md text-sm font-medium text-gray-200 hover:text-primary transition-colors duration-200 group"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    className="w-4 h-4 stroke-gray-300 group-hover:stroke-primary transition-colors duration-200"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
                  </svg>
                  <span>Docs</span>
                </Link>
              </motion.div>

              {!user ? (
                <motion.div custom={2} variants={menuItemVariants} initial="hidden" animate="visible">
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <Link to="/auth/login">
                      <Button variant="outline" size="sm" className="w-full border-gray-700 hover:bg-primary/80 hover:border-primary hover:text-primary">
                        Join us
                      </Button>
                    </Link>
                    {/* <Link to="/auth/register">
                      <Button size="sm" className="w-full bg-primary hover:bg-primary/80 text-white shadow-md shadow-primary/20">
                        Register
                      </Button>
                    </Link> */}
                  </div>
                </motion.div>
              ) : (
                <>
                  <motion.div custom={2} variants={menuItemVariants} initial="hidden" animate="visible">
                    <div className="mt-4 border-t border-gray-700/50 pt-4">
                      <p className="text-sm font-medium text-white">{user?.name || "User"}</p>
                      <p className="text-xs text-gray-400">{user?.email || "user@example.com"}</p>
                    </div>
                  </motion.div>

                  <motion.div custom={3} variants={menuItemVariants} initial="hidden" animate="visible">
                    <Link to="/dashboard" className="block py-3 flex items-center gap-2 text-white hover:text-primary">
                      <LayoutDashboard className="h-5 w-5" />
                      Dashboard
                    </Link>
                  </motion.div>

                  <motion.div custom={4} variants={menuItemVariants} initial="hidden" animate="visible">
                    <button
                      onClick={() => {
                        logout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full text-left flex items-center gap-2 py-3 text-white hover:text-primary transition duration-300"
                    >
                      <LogOut className="h-5 w-5" />
                      Sign Out
                    </button>
                  </motion.div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};