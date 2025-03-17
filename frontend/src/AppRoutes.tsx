// src/AppRoutes.jsx
import { Routes, Route } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Suspense, lazy, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

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
const ProjectPage = lazy(() => import("./pages/ProjectPage"));

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
  return (
    <div className="fixed inset-0 flex justify-center items-center">
      <div className="relative w-16 h-16">
        {/* Outer circle */}
        <div className="absolute top-0 left-0 w-full h-full border-4 border-t-blue-500 border-r-blue-300 border-b-blue-200 border-l-blue-400 rounded-full animate-spin"></div>

        {/* Inner circle */}
        <div
          className="absolute top-2 left-2 w-12 h-12 border-4 border-t-indigo-500 border-r-indigo-300 border-b-indigo-200 border-l-indigo-400 rounded-full animate-spin"
          style={{ animationDirection: "reverse", animationDuration: "0.8s" }}
        ></div>

        {/* Center dot */}
        <div className="absolute top-7 left-7 w-2 h-2 bg-blue-600 rounded-full"></div>
      </div>
    </div>
  );
};
