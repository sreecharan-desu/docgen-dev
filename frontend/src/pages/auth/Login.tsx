import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Link, useNavigate } from "react-router-dom"
import { FcGoogle } from 'react-icons/fc'
import { Github, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react'
import { useToast } from "@/components/ui/use-toast"
import { motion } from "framer-motion"

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isGithubLoading, setIsGithubLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [showEmailForm, setShowEmailForm] = useState(false)
  const [isEmailFormLoading, setIsEmailFormLoading] = useState(false)

  const { login, loginWithGoogle, loginWithGitHub } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      setIsEmailFormLoading(true)
      await login(email, password)
      navigate('/dashboard')
    } catch (error) {
      console.error('Login failed:', error)
      toast({
        variant: "destructive",
        title: "Authentication Failed",
        description: "Invalid email or password. Please try again.",
      })
    } finally {
      setIsEmailFormLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      setIsGoogleLoading(true)
      await loginWithGoogle()
    } catch (error) {
      console.error('Google login failed:', error)
      toast({
        variant: "destructive",
        title: "Authentication Failed",
        description: "Failed to initialize Google login. Please try again.",
      })
    } finally {
      setIsGoogleLoading(false)
    }
  }

  const handleGithubLogin = async () => {
    try {
      setIsGithubLoading(true)
      await loginWithGitHub()
    } catch (error) {
      console.error('GitHub login failed:', error)
      toast({
        variant: "destructive",
        title: "Authentication Failed",
        description: "Failed to initialize GitHub login. Please try again.",
      })
    } finally {
      setIsGithubLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Background gradient */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10 opacity-70"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        transition={{ duration: 1.5 }}
      />
      
      {/* Background pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      
      {/* Floating particles */}
      {Array(8).fill().map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-primary/20 blur-xl"
          style={{
            width: Math.random() * 100 + 50,
            height: Math.random() * 100 + 50,
          }}
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            opacity: 0,
          }}
          animate={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: Math.random() * 20 + 15,
            repeat: Infinity,
            delay: Math.random() * 5,
          }}
        />
      ))}
      
      <motion.div 
        className="w-full max-w-md space-y-8 p-8 border rounded-xl rgba(30, 41, 59, 0.4) border-white backdrop-blur-sm shadow-xl relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="text-center" variants={itemVariants}>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Welcome back</h2>
          <p className="text-muted-foreground mt-2">Sign in to your account</p>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Button
            type="button"
            variant="outline"
            className="w-full flex items-center justify-center gap-2 rgba(30, 41, 59, 0.4) hover:bg-gray-700 hover:border-primary transition-all duration-300 h-12"
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading}
          >
            {isGoogleLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <FcGoogle className="w-5 h-5" />
            )}
            {isGoogleLoading ? "Connecting..." : "Continue with Google"}
          </Button>
        </motion.div>
        
        <motion.div 
          className="relative flex items-center justify-center"
          variants={itemVariants}
        >
          <div className="absolute w-full h-px bg-border" />
          <span className="relative px-4 bg-card text-xs text-muted-foreground">
            Or
          </span>
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <Button
            type="button"
            variant="outline"
            className="w-full flex items-center justify-center gap-2 rgba(30, 41, 59, 0.4) hover:bg-gray-700 hover:border-primary transition-all duration-300 h-12"
            onClick={handleGithubLogin}
            disabled={isGithubLoading}
          >
            {isGithubLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Github className="w-5 h-5" />
            )}
            {isGithubLoading ? "Connecting..." : "Continue with GitHub"}
          </Button>
        </motion.div>

        {/* {showEmailForm ? (
          <motion.form 
            onSubmit={handleLogin} 
            className="space-y-4"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.3 }}
          >
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-10"
              />
            </div>

            <div className="flex justify-between items-center">
              <Link 
                to="/auth/forgot-password" 
                className="text-sm text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 bg-primary hover:bg-primary/90 transition-all duration-300"
              disabled={isEmailFormLoading}
            >
              {isEmailFormLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </motion.form>
        ) : (
          <motion.div variants={itemVariants}>
            <Button
              type="button"
              variant="secondary"
              className="w-full flex items-center justify-center gap-2 h-12 hover:bg-secondary/90 transition-all duration-300"
              onClick={() => setShowEmailForm(true)}
            >
              <Mail className="w-5 h-5" />
              Sign in with Email
            </Button>
          </motion.div>
        )} */}

        <motion.p 
          className="text-center text-sm text-muted-foreground"
          variants={itemVariants}
        >
          Don't have an account?{' '}
          <Link to="/auth/register" className="text-primary hover:underline font-medium">
            Register
          </Link>
        </motion.p>
      </motion.div>
    </div>
  )
}