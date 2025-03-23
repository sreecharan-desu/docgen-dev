import { Routes, Route, useLocation } from "react-router-dom";
import { ProtectedRoute } from "@/components/utilities/ProtectedRoute";
import { Suspense, lazy } from "react";
import { useAuth } from "./contexts/AuthContext";
import ProjectsSection from "./pages/projects/ProjectsSection";
import BillingSection from "./components/dashboard/BillingSection";
import SettingsSection from "./components/dashboard/SettingsSection";
import GithubSetupComplete from "./pages/auth/GithubSetupComplete";
import { Navbar } from "./components/utilities/Navbar";

// Lazy-loaded pages
const Index = lazy(() => import("./pages/Index"));
const Dashboard = lazy(() => import("./components/utilities/Dashboard"));
const Docs = lazy(() => import("./pages/docs/Index"));
const Login = lazy(() => import("./pages/auth/Login"));
const Register = lazy(() => import("./pages/auth/Register"));
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/auth/ResetPassword"));
const EmailVerification = lazy(() => import("./pages/auth/EmailVerification"));
const GoogleCallback = lazy(() => import("./pages/auth/GoogleCallback"));
const GitHubCallback = lazy(() => import("./pages/auth/GitHubCallback"));
const NotFound = lazy(() => import("./components/utilities/NotFound"));
const ProjectPage = lazy(() => import("./pages/projects/ProjectPage"));
const Sidebar = lazy(() => import("./components/dashboard/Sidebar"));
const RepoPage = lazy(() => import("./pages/repos/RepoPage"));


export const AppRoutes = () => {
  const { user } = useAuth();
  const location = useLocation();

  // Define routes where sidebar should NOT appear
  const noSidebarRoutes = ["/", "/auth/login", "/auth/register", "/docs"];

  if (user == null && localStorage.getItem("token")) {
    return <LoadingAnimation />;
  } else {
    return (
      <div className="flex flex-col min-h-screen">
        {" "}
        {/* Wrap everything in a full-height flex column */}
        <Navbar />
        <div className="flex flex-1">
          {" "}
          {/* This flex row will take remaining height */}
          {/* Conditionally render Sidebar */}
          {!noSidebarRoutes.includes(location.pathname) && (
            <Suspense fallback={<LoadingAnimation />}>
              <Sidebar />
            </Suspense>
          )}
          <main className="flex-1 mt-10">
            {" "}
            {/* Remove pt-14 since Navbar is outside */}
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
                path="/github/setup-error/*"
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
                path="/github/setup-complete"
                element={
                  <Suspense fallback={<LoadingAnimation />}>
                    <GithubSetupComplete />
                  </Suspense>
                }
              />
              <Route
                path="/projects"
                element={
                  <Suspense fallback={<LoadingAnimation />}>
                    <ProjectsSection />
                  </Suspense>
                }
              />
              <Route
                path="/pricing"
                element={
                  <Suspense fallback={<LoadingAnimation />}>
                    <BillingSection />
                  </Suspense>
                }
              />
              <Route
                path="/settings"
                element={
                  <Suspense fallback={<LoadingAnimation />}>
                    <SettingsSection />
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
              <Route
                path="/repo/:id"
                element={
                  <Suspense fallback={<LoadingAnimation />}>
                    <RepoPage />
                  </Suspense>
                }
              />
            </Routes>
          </main>
        </div>
      </div>
    );
  }
};

export const LoadingAnimation = () => {
  return (
    <div className="fixed inset-0 flex justify-center items-center">
      <div className="relative w-16 h-16">
        <div className="absolute top-0 left-0 w-full h-full border-4 border-t-blue-500 border-r-blue-300 border-b-blue-200 border-l-blue-400 rounded-full animate-spin"></div>
        <div
          className="absolute top-2 left-2 w-12 h-12 border-4 border-t-indigo-500 border-r-indigo-300 border-b-indigo-200 border-l-indigo-400 rounded-full animate-spin"
          style={{ animationDirection: "reverse", animationDuration: "0.8s" }}
        ></div>
        <div className="absolute top-7 left-7 w-2 h-2 bg-blue-600 rounded-full"></div>
      </div>
    </div>
  );
};
