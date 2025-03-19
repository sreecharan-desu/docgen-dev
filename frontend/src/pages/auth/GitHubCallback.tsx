import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { GITHUB_CALLBACK_URL } from "@/utils/config";

type GithubOperation = "auth" | "repo-import";

interface StateData {
  operation: GithubOperation;
  projectId?: string;
  returnPath?: string;
}

export default function GitHubCallback() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const error = params.get("error");
        const errorDescription = params.get("error_description");
        const token = params.get("token");
        const code = params.get("code");
        const stateParam = params.get("state");

        if (error) {
          setStatus("error");
          setErrorMessage(errorDescription || "Authentication failed");
          toast({
            variant: "destructive",
            title: "GitHub Operation Failed",
            description: errorDescription || "Please try again.",
          });
          setTimeout(() => navigate("/auth/login"), 3000);
          return;
        }

        let stateData: StateData = { operation: "auth" };
        if (stateParam) {
          try {
            stateData = JSON.parse(decodeURIComponent(stateParam));
          } catch {
            stateData = { operation: "repo-import", projectId: stateParam };
          }
        }

        if (token) {
          localStorage.setItem("token", token);
          const response = await fetch(`${GITHUB_CALLBACK_URL}/api/v1/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!response.ok) throw new Error("Failed to get user data");
          await response.json();
          navigate(stateData.returnPath || "/dashboard", { replace: true });
          return;
        }

        if (code) {
          const response = await fetch(GITHUB_CALLBACK_URL, {
            method: "POST", // Changed to POST (see note below)
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({ code, projectId: stateData.projectId }),
          });
          if (!response.ok) throw new Error("Failed to exchange code");
          const data = await response.json();

          if (stateData.operation === "auth") {
            localStorage.setItem("token", data.token);
          } else {
            localStorage.setItem("github_token", data.githubToken);
            if (data.githubUsername) localStorage.setItem("github_username", data.githubUsername);
          }

          setStatus("success");
          toast({
            title: "GitHub Connection Successful",
            description: "Successfully connected.",
          });

          const redirectPath =
            stateData.operation === "repo-import" && stateData.projectId
              ? `/projects/${stateData.projectId}`
              : stateData.returnPath || "/dashboard";
          setTimeout(() => navigate(redirectPath, { replace: true }), 1000);
          return;
        }

        setTimeout(() => {
          if (status === "loading") {
            setStatus("error");
            setErrorMessage("Operation timed out");
            toast({
              variant: "destructive",
              title: "GitHub Operation Failed",
              description: "Timed out. Please try again.",
            });
            navigate(stateData.returnPath || "/auth/login");
          }
        }, 10000);
      } catch (error) {
        setStatus("error");
        setErrorMessage("Operation failed");
        toast({
          variant: "destructive",
          title: "GitHub Operation Failed",
          description: "Please try again.",
        });
        setTimeout(() => navigate("/auth/login"), 3000);
      }
    };

    handleCallback();
  }, [navigate, toast, status]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-8 text-center space-y-4">
        {status === "loading" && (
          <>
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
            <h2 className="text-2xl font-bold">Connecting with GitHub</h2>
          </>
        )}
        {status === "success" && (
          <>
            <div className="text-primary h-8 w-8 mx-auto">✓</div>
            <h2 className="text-2xl font-bold text-primary">Connection Successful</h2>
            <p className="text-muted-foreground">Redirecting...</p>
          </>
        )}
        {status === "error" && (
          <>
            <h2 className="text-2xl font-bold text-destructive">Operation Failed</h2>
            <p className="text-muted-foreground">{errorMessage || "Redirecting..."}</p>
          </>
        )}
      </div>
    </div>
  );
}