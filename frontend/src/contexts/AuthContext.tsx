/* eslint-disable @typescript-eslint/no-explicit-any */
import { createContext, useContext, useEffect, useState } from 'react'
import { API_URL, GITHUB_CALLBACK_URL } from '@/utils/config'
import { useNavigate } from 'react-router-dom'
import { toast } from '@/components/ui/use-toast'

interface User {
  email_confirmed: boolean
  created_at: any
  id: string
  email: string
  name?: string
  avatarUrl?: string
}

interface AuthResponse {
  access_token: string
  token_type: string
  user: User
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  loginWithGoogle: () => Promise<void>
  loginWithGitHub: () => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    // Check for existing token and validate user session
    const token = localStorage.getItem('token')
    if (token) {
      validateToken(token)
    } else {
      setLoading(false)
    }
  }, [])

  const validateToken = async (token: string) => {
    try {
      const response = await fetch(`${API_URL}/api/v1/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
      } else {
        localStorage.removeItem('token')
      }
    } catch (error) {
      console.error('Token validation failed:', error)
      localStorage.removeItem('token')
    } finally {
      setLoading(false)
    }
  }

  const loginWithGoogle = async (): Promise<void> => {
    try {
      // Fetch OAuth configuration from the server
      const configResponse = await fetch(`${API_URL}/api/v1/auth/oauth-config`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Origin': window.location.origin
        },
      })
      
      if (!configResponse.ok) {
        const errorText = await configResponse.text()
        throw new Error(`Failed to get OAuth configuration: ${errorText}`)
      }
      
      const config = await configResponse.json()
      const callbackUrl = config.google_callback_url
      
      // Store the frontend callback URL for the final redirect
      localStorage.setItem('frontendCallbackUrl', config.frontend_callback_url)
      
      // Add state parameter for security
      const state = Math.random().toString(36).substring(7)
      localStorage.setItem('oauthState', state)
      
      // Redirect to Google auth URL with the backend callback URL
      window.location.href = `${API_URL}/api/v1/auth/google-auth?` +
        `redirect_uri=${encodeURIComponent(callbackUrl)}&` +
        `scope=${encodeURIComponent('email profile openid')}&` +
        `state=${state}`
    } catch (error) {
      console.error('Failed to initialize Google login:', error)
      toast({
        variant: "destructive",
        title: "Authentication Failed",
        description: "Failed to initialize Google login. Please try again.",
      })
    }
  }

  const loginWithGitHub = async (): Promise<void> => {
    try {
      // Fetch OAuth configuration from the server
      const configResponse = await fetch(`${API_URL}/api/v1/auth/oauth-config`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Origin': window.location.origin
        },
      })
      
      if (!configResponse.ok) {
        const errorText = await configResponse.text()
        throw new Error(`Failed to get OAuth configuration: ${errorText}`)
      }
      
      const config = await configResponse.json()
      
      // Add state parameter for security
      const state = Math.random().toString(36).substring(7)
      localStorage.setItem('oauthState', state)
      
      // Store the current origin in localStorage to check after redirect
      localStorage.setItem('authOrigin', window.location.origin)
      
      console.log('Initiating GitHub login...')
      
      // Redirect to GitHub auth URL
      window.location.href = `${API_URL}/api/v1/auth/github-auth?state=${state}`
    } catch (error) {
      console.error('Failed to initialize GitHub login:', error)
      toast({
        variant: "destructive",
        title: "Authentication Failed",
        description: "Failed to initialize GitHub login. Please try again.",
      })
    }
  }

  // Handle Google OAuth callback
  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        setLoading(true)
        const params = new URLSearchParams(window.location.search)
        const token = params.get('token')

        if (!token) {
          throw new Error('No token received')
        }

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
        setUser(userData)

        // Clean up URL and redirect to dashboard
        window.history.replaceState({}, document.title, '/dashboard')
        navigate('/dashboard', { replace: true })
      } catch (error) {
        console.error('OAuth authentication error:', error)
        toast({
          variant: "destructive",
          title: "Authentication Failed",
          description: "Failed to complete authentication. Please try again.",
        })
        navigate('/auth/login')
      } finally {
        setLoading(false)
      }
    }

    // Only run the callback handler if there's a token in the URL
    if (window.location.search.includes('token=')) {
      handleOAuthCallback()
    }
  }, [navigate])

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        throw new Error('Login failed')
      }

      const data = await response.json()
      localStorage.setItem('token', data.token)
      setUser(data.user)
      navigate('/dashboard')
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
    navigate('/')
  }

  const register = async (email: string, password: string, name: string) => {
    try {
      const response = await fetch(`${API_URL}/api/v1/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      })

      if (!response.ok) {
        throw new Error('Registration failed')
      }

      const data = await response.json()
      localStorage.setItem('token', data.token)
      setUser(data.user)
      navigate('/dashboard')
    } catch (error) {
      console.error('Registration error:', error)
      throw error
    }
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      register,
      loginWithGoogle,
      loginWithGitHub,
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 