import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";

// Lazy-loaded UI components
const Card = React.lazy(() => import("@/components/ui/card").then(mod => ({ default: mod.Card })));
const CardContent = React.lazy(() => import("@/components/ui/card").then(mod => ({ default: mod.CardContent })));
const CardHeader = React.lazy(() => import("@/components/ui/card").then(mod => ({ default: mod.CardHeader })));
const CardTitle = React.lazy(() => import("@/components/ui/card").then(mod => ({ default: mod.CardTitle })));
const CardDescription = React.lazy(() => import("@/components/ui/card").then(mod => ({ default: mod.CardDescription })));
const Button = React.lazy(() => import("@/components/ui/button").then(mod => ({ default: mod.Button })));

const BASE_URL = "https://api2.docgen.dev/api/v1";

const GithubSetupError = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [errorMessage, setErrorMessage] = useState("An unexpected error occurred during GitHub setup.");

  useEffect(() => {
    // Check if there's an error message passed via location state
    if (location.state?.error) {
      setErrorMessage(location.state.error);
    }
  }, [location]);

  const handleRetry = () => {
    // Store the current path to return to after authorization
    localStorage.setItem("github_redirect_url", location.state?.returnPath || "/projects");
    window.location.href = `${BASE_URL}/github/authorize-app`;
  };

  const handleReturn = () => {
    navigate("/projects");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>GitHub Setup Error</CardTitle>
          <CardDescription>Something went wrong during authorization</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div>
            <p className="text-red-500 mb-4">{errorMessage}</p>
            <div className="mt-4 space-x-4">
              <Button
                onClick={handleRetry}
                className="bg-[#00ff9d] text-black hover:bg-[#00ff9d]/90"
              >
                Retry Authorization
              </Button>
              <Button
                onClick={handleReturn}
                variant="outline"
              >
                Return to Projects
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GithubSetupError;