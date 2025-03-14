import { useState, useEffect } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { API_URL } from "@/config"

export default function EmailVerification() {
  const [verifying, setVerifying] = useState(true)
  const [verified, setVerified] = useState(false)
  const { toast } = useToast()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const type = searchParams.get('type')

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setVerifying(false)
        return
      }

      try {
        // Call your verify-email endpoint with the token
        const response = await fetch(`${API_URL}/api/v1/auth/verify-email`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (!response.ok) {
          throw new Error('Verification failed')
        }

        const data = await response.json()
        setVerified(data.verified)
        
        if (data.verified) {
          toast({
            title: "Email Verified",
            description: "Your email has been successfully verified.",
          })
        }
      } catch (error: any) {
        console.error('Verification error:', error)
        toast({
          title: "Verification Failed",
          description: "Failed to verify your email. The link may be invalid or expired.",
          variant: "destructive",
        })
        setVerified(false)
      } finally {
        setVerifying(false)
      }
    }

    verifyEmail()
  }, [token, toast])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 p-8 border rounded-lg bg-card text-center">
        {verifying ? (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Verifying Email</h2>
            <p className="text-muted-foreground">Please wait while we verify your email...</p>
          </div>
        ) : verified ? (
          <div className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-green-600">Email Verified!</h2>
              <p className="text-muted-foreground">Your email has been successfully verified.</p>
            </div>
            <Button onClick={() => navigate('/auth/login')}>
              Continue to Login
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-red-600">Verification Failed</h2>
              <p className="text-muted-foreground">
                The verification link is either invalid or has expired. Please try logging in again to request a new verification email.
              </p>
            </div>
            <Button onClick={() => navigate('/auth/login')}>
              Back to Login
            </Button>
          </div>
        )}
      </div>
    </div>
  )
} 