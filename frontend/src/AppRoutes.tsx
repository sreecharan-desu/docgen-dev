// src/AppRoutes.jsx
import { Routes, Route } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Suspense, lazy } from "react";
import { motion } from "framer-motion"

// Lazy-loaded pages
const Index = lazy(() => import("./pages/Index"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Docs = lazy(() => import("./pages/docs/Index"));
const Login = lazy(() => import("./pages/auth/Login"));
const Register = lazy(() => import("./pages/auth/Register"));
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/auth/ResetPassword"));
const EmailVerification = lazy(() => import("./pages/auth/EmailVerification"));
const GoogleCallback = lazy(() => import("./pages/auth/GoogleCallback"));
const GitHubCallback = lazy(() => import("./pages/auth/GitHubCallback"));
const NotFound = lazy(() => import("./pages/NotFound"));

export const AppRoutes = () => {
  return (
    <>
      <Navbar />
      <main className="pt-14 min-h-screen">
        <Routes>
          <Route
            path="/"
            element={
              <Suspense fallback={<LoadingAnimation />}>
                <Index />
              </Suspense>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingAnimation />}>
                  <Dashboard />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/auth/login"
            element={
              <Suspense fallback={<LoadingAnimation />}>
                <Login />
              </Suspense>
            }
          />
          <Route
            path="/auth/register"
            element={
              <Suspense fallback={<LoadingAnimation />}>
                <Register />
              </Suspense>
            }
          />
          <Route
            path="/auth/forgot-password"
            element={
              <Suspense fallback={<LoadingAnimation />}>
                <ForgotPassword />
              </Suspense>
            }
          />
          <Route
            path="/auth/reset-password"
            element={
              <Suspense fallback={<LoadingAnimation />}>
                <ResetPassword />
              </Suspense>
            }
          />
          <Route
            path="/auth/verify"
            element={
              <Suspense fallback={<LoadingAnimation />}>
                <EmailVerification />
              </Suspense>
            }
          />
          <Route
            path="/auth/callback/google"
            element={
              <Suspense fallback={<LoadingAnimation />}>
                <GoogleCallback />
              </Suspense>
            }
          />
          <Route
            path="/auth/callback/github"
            element={
              <Suspense fallback={<LoadingAnimation />}>
                <GitHubCallback />
              </Suspense>
            }
          />
          <Route
            path="/docs"
            element={
              <Suspense fallback={<LoadingAnimation />}>
                <Docs />
              </Suspense>
            }
          />
          <Route
            path="*"
            element={
              <Suspense fallback={<LoadingAnimation />}>
                <NotFound />
              </Suspense>
            }
          />
        </Routes>
      </main>
    </>
  );
};
const LoadingAnimation = () => {
  return (
    <div className="flex items-center justify-center h-screen w-full rgba(30, 41, 59,1) relative overflow-hidden">
      {/* Background Gradient Glow */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 via-blue-500/10 to-transparent blur-[120px]"
        animate={{ opacity: [0.4, 0.6, 0.4] }}
        transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
      />
      {/* Floating Pages Animation */}
      <div className="relative flex items-center justify-center w-32 h-32">
        {["blue-400", "indigo-400", "purple-400"].map((color, i) => (
          <motion.div
            key={i}
            className={`absolute w-16 h-20 bg-white/90 shadow-lg rounded-md p-2 border border-slate-200 flex flex-col`}
            style={{ top: i * 8, left: i * 8 }}
            animate={{
              y: [10, 0, -10],
              opacity: [0, 1, 1, 0],
            }}
            transition={{
              duration: 2,
              times: [0, 0.2, 0.8, 1],
              repeat: Infinity,
              repeatDelay: 0.5,
            }}
          >
            <div className={`h-2 w-10 bg-${color} rounded mb-1`} />
            <div className="h-1 w-8 bg-slate-300 rounded mb-1" />
            <div className="h-1 w-12 bg-slate-300 rounded mb-1" />
          </motion.div>
        ))}
      </div>
    </div >
  );
};
