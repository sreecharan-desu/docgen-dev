import { Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useToast } from "@/components/ui/use-toast"
import { API_URL } from "@/utils/config"

export default function GitHubCallback() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState<string>('')
  const navigate = useNavigate()
  const { toast } = useToast()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log("GitHubCallback: Processing callback")
        // Check if there's an error parameter in the URL
        const params = new URLSearchParams(window.location.search)
        const error = params.get('error')
        const errorDescription = params.get('error_description')
        const token = params.get('token')
        const code = params.get('code')
        const state = params.get('state')

        console.log("GitHubCallback: URL parameters", { 
          error, 
          token: token ? "exists" : "missing", 
          code: code ? "exists" : "missing",
          state: state ? "exists" : "missing"
        })

        if (error) {
          setStatus('error')
          setErrorMessage(errorDescription || 'Authentication failed')
          toast({
            variant: "destructive",
            title: "Authentication Failed",
            description: errorDescription || "GitHub authentication failed. Please try again.",
          })
          
          // Redirect back to login after a short delay
          setTimeout(() => {
            navigate('/auth/login')
          }, 3000)
          return
        }

        // Handle successful authentication with token directly in URL
        if (token) {
          console.log("GitHubCallback: Token found in URL, processing login")
          // Store the token
          localStorage.setItem('token', token)

          // Validate the token to get user data
          const response = await fetch(`${API_URL}/api/v1/auth/me`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })

          if (!response.ok) {
            throw new Error('Failed to get user data')
          }

          const userData = await response.json()
          console.log("GitHubCallback: User data retrieved successfully")
          
          // Clean up URL and redirect to dashboard
          window.history.replaceState({}, document.title, '/dashboard')
          navigate('/dashboard', { replace: true })
          return
        }

        // If we get here, we're still waiting for the token or something went wrong
        console.log("GitHubCallback: No token found in URL, waiting or error")
        
        // After a timeout, redirect to login if no token is received
        setTimeout(() => {
          if (status === 'loading') {
            setStatus('error')
            setErrorMessage('Authentication timed out')
            toast({
              variant: "destructive",
              title: "Authentication Failed",
              description: "Authentication timed out. Please try again.",
            })
            navigate('/auth/login')
          }
        }, 10000) // 10 second timeout
      } catch (error) {
        console.error('GitHub authentication error:', error)
        setStatus('error')
        setErrorMessage('Authentication failed')
        toast({
          variant: "destructive",
          title: "Authentication Failed",
          description: "Failed to complete authentication. Please try again.",
        })
        
        // Redirect back to login after a short delay
        setTimeout(() => {
          navigate('/auth/login')
        }, 3000)
      }
    }

    handleCallback()
  }, [navigate, toast, status])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 p-8 text-center">
        <div className="flex flex-col items-center gap-4">
          {status === 'loading' && (
            <>
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <div>
                <h2 className="text-2xl font-bold">Completing Sign In</h2>
                <p className="text-muted-foreground mt-2">
                  Please wait while we complete your GitHub sign in...
                </p>
              </div>
            </>
          )}
          
          {status === 'error' && (
            <div>
              <h2 className="text-2xl font-bold text-destructive">Authentication Failed</h2>
              <p className="text-muted-foreground mt-2">
                {errorMessage || "Failed to authenticate with GitHub. Redirecting back to login..."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 