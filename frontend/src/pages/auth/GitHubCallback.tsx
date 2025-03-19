import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { GITHUB_CALLBACK_URL } from "@/utils/config";

// Define GitHub operation types
type GithubOperation = "auth" | "repo-import" | "repo-access";

interface StateData {
  operation: GithubOperation;
  projectId?: string;
  returnPath?: string;
}

export default function GitHubCallback() {
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [statusMessage, setStatusMessage] = useState<string>(
    "Processing GitHub authorization..."
  );
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log("GitHubCallback: Processing callback");
        // Check parameters in the URL
        const params = new URLSearchParams(window.location.search);
        const error = params.get("error");
        const errorDescription = params.get("error_description");
        const token = params.get("token");
        const code = params.get("code");
        const stateParam = params.get("state");

        console.log("GitHubCallback: URL parameters", {
          error,
          token: token ? "exists" : "missing",
          code: code ? "exists" : "missing",
          state: stateParam ? "exists" : "missing",
        });

        // Handle error cases
        if (error) {
          setStatus("error");
          setErrorMessage(errorDescription || "Authentication failed");
          toast({
            variant: "destructive",
            title: "GitHub Operation Failed",
            description:
              errorDescription || "GitHub operation failed. Please try again.",
          });

          // Redirect back to appropriate page after a short delay
          setTimeout(() => {
            navigate("/auth/login");
          }, 3000);
          return;
        }

        // Parse the state parameter to determine operation type and context
        let stateData: StateData = { operation: "auth" };
        if (stateParam) {
          try {
            stateData = JSON.parse(decodeURIComponent(stateParam));
          } catch (e) {
            console.warn("Failed to parse state parameter:", e);
            // If state isn't valid JSON, assume it's just a project ID (backward compatibility)
            stateData = { operation: "repo-import", projectId: stateParam };
          }
        }

        // Handle direct token in URL (for authentication)
        if (token) {

          console.log("GitHubCallback: Token found in URL, processing login");
          // Store the token
          localStorage.setItem("token", token);

          

          // Validate the token to get user data
          const response = await fetch(
            `${GITHUB_CALLBACK_URL}/api/v1/auth/me`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (!response.ok) {
            throw new Error("Failed to get user data");
          }

          const userData = await response.json();
          localStorage.setItem("GithubData",userData)
          console.log("GitHubCallback: User data retrieved successfully",userData);

          // Clean up URL and redirect to dashboard or specified return path
          window.history.replaceState(
            {},
            document.title,
            stateData.returnPath || "/dashboard"
          );
          navigate(stateData.returnPath || "/dashboard", { replace: true });
          return;
        }

        // Handle authorization code flow for repo operations
        if (code) {
          setStatusMessage("Exchanging authorization code...");
          console.log("GitHubCallback: Code received, exchanging for token");

          // Different operations require different backend endpoints
          const endpoint = GITHUB_CALLBACK_URL;

          // Exchange the code for a token via the backend
          const response = await fetch(`${endpoint}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({
              code,
              projectId: stateData.projectId,
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
              errorData.message || "Failed to exchange GitHub code"
            );
          }

          const data = await response.json();

          // For auth operations, store the main auth token
          if (stateData.operation === "auth") {
            localStorage.setItem("token", data.token);
            localStorage.setItem("github_token", data.githubToken);
            localStorage.setItem("github_username", data.githubUsername);
          }
          // For repo operations, store GitHub token separately
          else {
            localStorage.setItem("github_token", data.githubToken);

            // Store GitHub username if available
            if (data.githubUsername) {
              localStorage.setItem("github_username", data.githubUsername);
            }


            // Fetch username manually if not provided

  if (!data.githubUsername) {
    try {
      const userResponse = await fetch("https://api.github.com/user", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      if (userResponse.ok) {
        const userInfo = await userResponse.json();
        localStorage.setItem("github_username", userInfo.login);
      } else {
        console.warn("Failed to fetch GitHub username");
      }
    } catch (e) {
      console.error("Error fetching GitHub username:", e);
    }
  }
          }

          setStatus("success");
          toast({
            title: "GitHub Connection Successful",
            description: "Successfully connected to GitHub.",
          });

          // Determine where to redirect
          let redirectPath = "/dashboard";
          if (stateData.operation === "repo-import" && stateData.projectId) {
            redirectPath = `/projects/${stateData.projectId}`;
          } else if (stateData.returnPath) {
            redirectPath = stateData.returnPath;
          }

          // Redirect to the appropriate page
          setTimeout(() => {
            navigate(redirectPath, { replace: true });
          }, 1000);

          return;
        }

        // If we get here, we're still waiting for the token or something went wrong
        console.log(
          "GitHubCallback: No token or code found in URL, waiting or error"
        );

        // After a timeout, redirect if no token/code is received
        setTimeout(() => {
          if (status === "loading") {
            setStatus("error");
            setErrorMessage("Operation timed out");
            toast({
              variant: "destructive",
              title: "GitHub Operation Failed",
              description: "Operation timed out. Please try again.",
            });
            navigate(stateData.returnPath || "/auth/login");
          }
        }, 10000); // 10 second timeout
      } catch (error) {
        console.error("GitHub operation error:", error);
        setStatus("error");
        setErrorMessage("Operation failed");
        toast({
          variant: "destructive",
          title: "GitHub Operation Failed",
          description: "Failed to complete GitHub operation. Please try again.",
        });

        // Redirect back to login after a short delay
        setTimeout(() => {
          navigate("/auth/login");
        }, 3000);
      }
    };

    handleCallback();
  }, [navigate, toast, status]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 p-8 text-center">
        <div className="flex flex-col items-center gap-4">
          {status === "loading" && (
            <>
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <div>
                <h2 className="text-2xl font-bold">Connecting with GitHub</h2>
                <p className="text-muted-foreground mt-2">{statusMessage}</p>
              </div>
            </>
          )}

          {status === "success" && (
            <>
              <div className="text-primary h-8 w-8">✓</div>
              <div>
                <h2 className="text-2xl font-bold text-primary">
                  Connection Successful
                </h2>
                <p className="text-muted-foreground mt-2">
                  Successfully connected to GitHub. Redirecting...
                </p>
              </div>
            </>
          )}

          {status === "error" && (
            <div>
              <h2 className="text-2xl font-bold text-destructive">
                Operation Failed
              </h2>
              <p className="text-muted-foreground mt-2">
                {errorMessage ||
                  "Failed to connect with GitHub. Redirecting..."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
