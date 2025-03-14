import { Routes, Route } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Docs from "./pages/docs/Index";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import EmailVerification from "./pages/auth/EmailVerification";
import GoogleCallback from "./pages/auth/GoogleCallback";
import GitHubCallback from "./pages/auth/GitHubCallback";
import NotFound from "./pages/NotFound";

export const AppRoutes = () => {
  return (
    <>
      <Navbar />
      <main className="pt-14 min-h-screen">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/register" element={<Register />} />
          <Route path="/auth/forgot-password" element={<ForgotPassword />} />
          <Route path="/auth/reset-password" element={<ResetPassword />} />
          <Route path="/auth/verify" element={<EmailVerification />} />
          <Route path="/verify" element={<EmailVerification />} />
          <Route path="/auth/callback/google" element={<GoogleCallback />} />
          <Route path="/auth/callback/github" element={<GitHubCallback />} />
          <Route path="/docs" element={<Docs />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </>
  );
}; 