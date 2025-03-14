import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Link, useLocation } from "react-router-dom"
import { LayoutDashboard, Menu, X, ChevronDown, Github, LogOut } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

export const Navbar = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const { login, register, user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false)
    setUserMenuOpen(false)
  }, [location.pathname])

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await login(email, password)
    } catch (error) {
      console.error('Error signing in:', error)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await register(email, password, name)
    } catch (error) {
      console.error('Error registering:', error)
    }
  }

  const handleStartFree = () => {
    navigate('/auth/login')
  }

  const navbarVariants = {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  }

  const mobileMenuVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: { opacity: 1, height: 'auto', transition: { duration: 0.3 } }
  }

  const userMenuVariants = {
    hidden: { opacity: 0, scale: 0.95, y: -5 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.2 } }
  }

  return (
    <motion.nav 
      className={`fixed top-0 w-full z-50 border-b transition-all duration-300 ${
        scrolled 
          ? 'bg-background/95 backdrop-blur-md border-gray-800/80 shadow-lg' 
          : 'bg-background/60 backdrop-blur-sm border-gray-800/30'
      }`}
      initial="initial"
      animate="animate"
      variants={navbarVariants}
    >
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center group">
            <motion.img 
              src="/docgen-logo.png" 
              alt="DocGen Logo" 
              className="h-10 w-10 sm:h-12 sm:w-12 object-contain mt-2 transition-transform duration-300 group-hover:scale-110" 
              whileHover={{ rotate: [0, -10, 10, -5, 0], transition: { duration: 0.5 } }}
            />
            <span className="font-semibold text-base sm:text-lg text-white leading-none ml-2 group-hover:text-primary transition-colors duration-300">
              DocGen
            </span>
          </Link>
          
          <div className="hidden md:flex gap-6 ml-6">
            <Link 
              to="/docs" 
              className="text-base font-medium text-white hover:text-primary transition-colors duration-300 relative group"
            >
              Documentation
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
            </Link>
            <a 
              href="https://github.com/docgen-dev" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-base font-medium text-white hover:text-primary transition-colors duration-300 relative group flex items-center gap-1"
            >
              <Github className="h-4 w-4" />
              GitHub
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
            </a>
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4 relative">
              <Link to="/dashboard">
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2 border-gray-700 hover:border-primary hover:bg-primary/10 transition-all duration-300"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
              
              <div className="relative">
                <Button 
                  variant="ghost"
                  className="text-muted-foreground hover:text-foreground flex items-center gap-1"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                >
                  <div className={`h-8 w-8 rounded-full bg-green-500/30 flex items-center justify-center text-green-800`}>
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${userMenuOpen ? 'rotate-180' : ''}`} />
                </Button>
                
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div 
                      className="absolute right-0 mt-2 w-48 bg-gray-900 border border-gray-800 rounded-md shadow-lg overflow-hidden z-50"
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      variants={userMenuVariants}
                    >
                      <div className={`p-4 border-b border-border/60 ${userMenuOpen ? 'flex justify-center' : ''} bg-green-50 dark:bg-green-900/20`}>
                        <div className={`flex items-center ${userMenuOpen ? 'justify-center' : 'space-x-3'} mb-4`}>
                          <motion.div whileHover={{ scale: 1.1 }} transition={{ duration: 0.2 }}>
                            <Avatar className="h-10 w-10 ring-2 ring-green-500/30 ring-offset-2 ring-offset-background">
                              <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || user?.email || 'User'}`} />
                              <AvatarFallback>{getUserInitials()}</AvatarFallback>
                            </Avatar>
                          </motion.div>
                          {!userMenuOpen && (
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{user?.name || 'User'}</p>
                              <p className="text-xs text-muted-foreground truncate">{user?.email || 'No email'}</p>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="py-1">
                        <Link 
                          to="/dashboard" 
                          className="flex items-center gap-2 px-4 py-2 text-sm text-white hover:bg-gray-800 transition-colors duration-200"
                        >
                          <LayoutDashboard className="h-4 w-4" />
                          Dashboard
                        </Link>
                        <button
                          onClick={logout}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-white hover:bg-gray-800 transition-colors duration-200"
                        >
                          <LogOut className="h-4 w-4" />
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          ) : (
            <>
              <Link to="/auth/login">
                <Button 
                  variant="outline" 
                  className="border-gray-700 hover:border-primary hover:bg-primary/10 transition-all duration-300"
                >
                  Sign In
                </Button>
              </Link>
              <Link to="/auth/register">
                <Button 
                  className="bg-gradient-to-r from-primary to-primary/80 text-background hover:opacity-90 transition-all duration-300"
                >
                  Register
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center gap-2">
          <Button 
            onClick={handleStartFree} 
            size="sm" 
            className="px-3 bg-gradient-to-r from-primary to-primary/80 text-background hover:opacity-90 transition-all duration-300"
          >
            Start Free
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="p-1.5"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <motion.div
              animate={{ rotate: isMobileMenuOpen ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </motion.div>
          </Button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            className="md:hidden border-t border-gray-800"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={mobileMenuVariants}
          >
            <div className="py-2">
              <Link 
                to="/docs" 
                className="flex items-center px-4 py-3 hover:bg-gray-800/50 transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="text-sm font-medium text-white hover:text-primary">Documentation</span>
              </Link>
              
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-3 hover:bg-gray-800/50 transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Github className="h-4 w-4" />
                <span className="text-sm font-medium text-white hover:text-primary">GitHub</span>
              </a>
              
              {!user ? (
                <div className="grid grid-cols-2 gap-2 p-3">
                  <Link to="/auth/login" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full border-gray-700">Sign In</Button>
                  </Link>
                  <Link to="/auth/register" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button size="sm" className="w-full bg-gradient-to-r from-primary to-primary/80">Register</Button>
                  </Link>
                </div>
              ) : (
                <>
                  <div className="px-4 py-3 border-t border-gray-800">
                    <p className="text-sm font-medium text-white">{user.name || 'User'}</p>
                    <p className="text-xs text-gray-400 truncate">{user.email || 'user@example.com'}</p>
                  </div>
                  <Link 
                    to="/dashboard" 
                    className="flex items-center gap-2 px-4 py-3 hover:bg-gray-800/50 transition-colors duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    <span className="text-sm font-medium">Dashboard</span>
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-left flex items-center gap-2 px-4 py-3 text-sm font-medium text-white hover:bg-gray-800/50 transition-colors duration-200"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
} 