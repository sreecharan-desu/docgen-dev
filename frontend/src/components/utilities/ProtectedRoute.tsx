import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const { toast } = useToast();

  if (!user) {
    toast({
      title: "Error",
      description: "You must be logged in to access this page",
      variant: "destructive",
    });
    return <Navigate to="/auth/login" />;
  }

  return children;
};
