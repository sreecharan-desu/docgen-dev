import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [registered, setRegistered] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(email, password, name);
      setRegistered(true);
    } catch (error) {
      console.error("Registration failed:", error);
    }
  };

  if (registered) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-full max-w-md space-y-8 p-8 border rounded-lg bg-card text-center">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Check Your Email</h2>
            <p className="text-muted-foreground">
              We've sent a verification link to your email address. Please check
              your inbox and click the link to verify your account.
            </p>
            <p className="text-sm text-muted-foreground">
              Don't see the email? Check your spam folder.
            </p>
          </div>
          <Button onClick={() => navigate("/auth/login")} variant="outline">
            Back to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 p-8 border rounded-lg bg-card">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Create an account</h2>
          <p className="text-muted-foreground mt-2">
            Registration temporarily disabled
          </p>
          <p className="text-muted-foreground mt-4 text-sm">
            Please use Google login to access the platform
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-6 opacity-50">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              required
              disabled
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              disabled
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
              disabled
            />
          </div>

          <Button type="submit" className="w-full" disabled>
            Register
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/auth/login" className="text-primary hover:underline">
            Sign in with Google
          </Link>
        </p>
      </div>
    </div>
  );
}
