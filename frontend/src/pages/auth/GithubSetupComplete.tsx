import React, { useEffect, useState } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

const Card = React.lazy(() => import("@/components/ui/card").then(mod => ({ default: mod.Card })));
const CardContent = React.lazy(() => import("@/components/ui/card").then(mod => ({ default: mod.CardContent })));
const CardHeader = React.lazy(() => import("@/components/ui/card").then(mod => ({ default: mod.CardHeader })));
const CardTitle = React.lazy(() => import("@/components/ui/card").then(mod => ({ default: mod.CardTitle })));
const CardDescription = React.lazy(() => import("@/components/ui/card").then(mod => ({ default: mod.CardDescription })));
const Progress = React.lazy(() => import("@/components/ui/progress").then(mod => ({ default: mod.Progress })));

const BASE_URL = "https://api2.docgen.dev/api/v1";

const apiCall = async (url, options, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP error ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
};

const GithubSetupComplete = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [redirecting, setRedirecting] = useState(false);

  const checkGithubAccess = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return false;
    }

    try {
      const response = await apiCall(`${BASE_URL}/github/check-repo-access`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });

      if (response.has_access === false && response.setup_url) {
        setRedirecting(true);
        let progressValue = 0;
        const interval = setInterval(() => {
          progressValue += 20;
          setProgress(progressValue);
          if (progressValue >= 100) {
            clearInterval(interval);
            window.location.replace(response.setup_url);
          }
        }, 500);
        return false;
      }
      return response.has_access;
    } catch (error) {
      navigate("/github/setup-error", {
        state: {
          error: "Failed to verify GitHub access: " + error.message,
          returnPath: location.pathname + location.search,
        },
      });
      return false;
    }
  };

  useEffect(() => {
    const handleSetupComplete = async () => {
      setIsLoading(true);
      const hasAccess = await checkGithubAccess();

      if (hasAccess) {
        const redirectUrl = localStorage.getItem("github_redirect_url") || "/projects";
        localStorage.removeItem("github_redirect_url");
        toast.success("GitHub authorization successful!");
        navigate(redirectUrl);
      } else if (!redirecting) {
        setIsLoading(false);
      }
    };

    handleSetupComplete();
  }, [navigate, redirecting]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>GitHub Setup</CardTitle>
          <CardDescription>
            {isLoading && !redirecting ? "Verifying GitHub authorization..." : "Authorization Status"}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          {isLoading && !redirecting ? (
            <div className="animate-pulse">
              <div className="h-6 bg-gray-300 rounded w-3/4 mx-auto"></div>
              <p className="mt-4 text-gray-500">Please wait while we verify your GitHub access...</p>
            </div>
          ) : redirecting ? (
            <div>
              <p className="text-gray-500 mb-4">Redirecting to GitHub authorization...</p>
              <Progress value={progress} className="w-full" />
            </div>
          ) : (
            <p className="text-green-500">Redirecting you back to your project...</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GithubSetupComplete;