import { Loader2 } from "lucide-react";

export default function GoogleCallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 p-8 text-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <div>
            <h2 className="text-2xl font-bold">Completing Sign In</h2>
            <p className="text-muted-foreground mt-2">
              Please wait while we complete your Google sign in...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
