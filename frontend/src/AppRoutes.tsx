// src/AppRoutes.jsx
import { Routes, Route } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Suspense, lazy, useEffect, useState } from "react";
import { motion } from "framer-motion"
import { Sparkles } from 'lucide-react';


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
const ProjectPage = lazy(()=>import('./pages/ProjectPage'))

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
          <Route
            path="/project/:id"
            element={
              <Suspense fallback={<LoadingAnimation />}>
                <ProjectPage />
              </Suspense>
            }
          />
        </Routes>
      </main>
    </>
  );
};

const LoadingAnimation = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [progress, setProgress] = useState(0);

  // Simulate loading progress
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + Math.random() * 3;
        return newProgress > 100 ? 0 : newProgress;
      });
    }, 200);

    return () => clearInterval(timer);
  }, []);

  // Track mouse movement for interactive effects
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left - rect.width / 2,
      y: e.clientY - rect.top - rect.height / 2,
    });
  };

  return (
    <motion.div
      className="flex items-center justify-center h-screen w-full bg-slate-900 relative overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Responsive background gradient that follows cursor */}
      <motion.div
        className="absolute inset-0 bg-transaprent"
        animate={{
          opacity: [0.4, 0.6, 0.4],
          backgroundPosition: isHovering ? `${mousePosition.x * 0.02}px ${mousePosition.y * 0.02}px` : "0% 0%"
        }}
        transition={{
          opacity: { duration: 3, repeat: Infinity, repeatType: "reverse" },
          backgroundPosition: { duration: 0.5 }
        }}
      />

      {/* Subtle particle effect */}
      {Array(12).fill(0).map((_, i) => (
        <motion.div
          key={`particle-${i}`}
          className="absolute w-1 h-1 bg-white/30 rounded-full"
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
          }}
          animate={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: 3 + Math.random() * 5,
            repeat: Infinity,
            delay: Math.random() * 5,
          }}
        />
      ))}

      {/* Central loading element */}
      <motion.div
        className="relative flex items-center justify-center w-40 h-40 cursor-pointer"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={{
          rotateZ: isHovering ? mousePosition.x * 0.05 : 0,
          y: isHovering ? mousePosition.y * 0.05 : 0,
        }}
        transition={{ type: "spring", stiffness: 150, damping: 15 }}
      >
        {/* Pulsing ring */}
        <motion.div
          className="absolute inset-0 border-2 border-blue-400/50 rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.7, 0.3, 0.7],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Progress circle */}
        <svg className="absolute inset-0" width="100%" height="100%" viewBox="0 0 100 100">
          <motion.circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="rgba(99, 102, 241, 0.6)"
            strokeWidth="2"
            strokeDasharray="251.2"
            animate={{
              strokeDashoffset: 251.2 - (251.2 * progress) / 100,
            }}
            transition={{ duration: 0.5 }}
            style={{ transformOrigin: "center", transform: "rotate(-90deg)" }}
          />
        </svg>

        {/* Floating "pages" */}
        {["blue-400", "indigo-400", "purple-400"].map((color, i) => (
          <motion.div
            key={i}
            className={`absolute w-16 h-20 bg-white/90 shadow-lg rounded-md p-2 border border-slate-200 flex flex-col backdrop-blur-sm`}
            style={{
              zIndex: 10 - i,
              transformOrigin: "center"
            }}
            animate={{
              y: [10, -5, -20],
              x: [i * 8, i * 10, i * 12],
              opacity: [0, 1, 0],
              rotateZ: [0, i % 2 === 0 ? 5 : -5],
              scale: [0.9, 1, 0.9],
            }}
            transition={{
              duration: 2.5,
              times: [0, 0.5, 1],
              repeat: Infinity,
              repeatDelay: i * 0.2,
              ease: "easeInOut",
            }}
            whileHover={{ scale: 1.1, transition: { duration: 0.2 } }}
          >
            <div className={`h-2 w-10 bg-${color} rounded mb-1`} />
            <div className="h-1 w-8 bg-slate-300 rounded mb-1" />
            <div className="h-1 w-12 bg-slate-300 rounded mb-1" />
            <div className="h-1 w-6 bg-slate-300 rounded" />
          </motion.div>
        ))}

        {/* Central sparkle effect */}
        <motion.div
          className="absolute"
          animate={{
            scale: [0.8, 1.2, 0.8],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <Sparkles className="text-indigo-300 w-6 h-6" />
        </motion.div>

        {/* Loading text */}
        <motion.p
          className="absolute -bottom-12 text-white/70 text-sm font-light tracking-wider"
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {Math.floor(progress)}%
        </motion.p>
      </motion.div>
    </motion.div>
  );
};

