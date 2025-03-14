import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Link, useNavigate } from "react-router-dom"
import { FcGoogle } from 'react-icons/fc'
import { Github } from 'lucide-react'
import { useToast } from "@/components/ui/use-toast"

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isGithubLoading, setIsGithubLoading] = useState(false)

  const { login, loginWithGoogle, loginWithGitHub } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()

  const handleLogin = async (e: React.FormEvent) => {
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (error) {
      console.error('Login failed:', error)
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
      setIsGithubLoading(false)
    }
  }
  

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 p-8 border rounded-lg bg-card">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Welcome back</h2>
          <p className="text-muted-foreground mt-2">Sign in to your account</p>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full flex items-center justify-center gap-2"
          onClick={loginWithGoogle}
        >
          <FcGoogle className="w-5 h-5" />
          Continue with Google
        </Button>
        <div className="text-center">
          Or
        </div>
        <Button
          type="button"
          variant="outline"
          className="w-full flex items-center justify-center gap-2"
          onClick={handleGithubLogin}
          disabled={isGithubLoading}
        >
          {isGithubLoading ? (
            <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2" />
          ) : (
            <Github className="w-5 h-5" />
          )}
          {isGithubLoading ? "Connecting..." : "Continue with GitHub"}
        </Button>

        {/* <form onSubmit={handleLogin} className="space-y-4 opacity-50">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-between items-center">
            <Link 
              to="/auth/forgot-password" 
              className="text-sm text-primary hover:underline pointer-events-none"
              onClick={(e) => e.preventDefault()}
            >
              Forgot password?
            </Link>
          </div>

          <Button type="submit" className="w-full" onClick={handleLogin}>
            Sign in
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Don't have an account?{' '}
          <Link to="/auth/register" className="text-primary hover:underline pointer-events-none" onClick={(e) => e.preventDefault()}>
            Register
          </Link>
        </p> */}
      </div>
    </div>
  )
} 