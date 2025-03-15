import { useState, lazy, Suspense } from "react";
import { Plus, FolderKanban, AlertCircle } from "lucide-react";
import { CREATE_PROJECT_API } from "@/utils/apis";

// Lazy load components
const Button = lazy(() => import("@/components/ui/button").then((mod) => ({ default: mod.Button })));
const Input = lazy(() => import("@/components/ui/input").then((mod) => ({ default: mod.Input })));
const Label = lazy(() => import("@/components/ui/label").then((mod) => ({ default: mod.Label })));
const Card = lazy(() => import("@/components/ui/card").then((mod) => ({ default: mod.Card })));
const CardContent = lazy(() => import("@/components/ui/card").then((mod) => ({ default: mod.CardContent })));
const Dialog = lazy(() => import("@/components/ui/dialog").then((mod) => ({ default: mod.Dialog })));
const DialogContent = lazy(() => import("@/components/ui/dialog").then((mod) => ({ default: mod.DialogContent })));
const DialogHeader = lazy(() => import("@/components/ui/dialog").then((mod) => ({ default: mod.DialogHeader })));
const DialogTitle = lazy(() => import("@/components/ui/dialog").then((mod) => ({ default: mod.DialogTitle })));
const DialogFooter = lazy(() => import("@/components/ui/dialog").then((mod) => ({ default: mod.DialogFooter })));
const DialogClose = lazy(() => import("@/components/ui/dialog").then((mod) => ({ default: mod.DialogClose })));
const Alert = lazy(() => import("@/components/ui/alert").then((mod) => ({ default: mod.Alert })));
const AlertDescription = lazy(() => import("@/components/ui/alert").then((mod) => ({ default: mod.AlertDescription })));

const ProjectsSection = () => {
  const [open, setOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCreateProject = async () => {
    if (!projectName.trim()) {
      setError("Project name cannot be empty");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`${CREATE_PROJECT_API}/projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: projectName }),
      });

      if (!response.ok) throw new Error("Failed to create project");

      setOpen(false);
      setProjectName("");
    } catch (err) {
      setError("Error processing request. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <div className="space-y-6 p-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Projects</h1>
          <p className="text-muted-foreground">Manage your DocGen projects</p>
        </div>

        {/* Card Skeleton while loading */}
        <Suspense
          fallback={
            <div className="p-4 border rounded-lg">
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          }
        >
          <Card className="overflow-hidden">
            <div className="h-1 bg-primary/20"></div>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="rounded-full bg-primary/10 p-3 mb-4">
                <FolderKanban className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Projects</h3>
              <p className="text-muted-foreground text-center mb-4">
                This feature is coming soon. You'll be able to create and manage your projects here.
              </p>
              <Button variant="outline" onClick={() => setOpen(true)} className="opacity-100">
                <Plus className="h-4 w-4 mr-2" />
                Create Project
              </Button>
            </CardContent>
          </Card>
        </Suspense>

        {/* Dialog Skeleton while loading */}
        <Dialog open={open} onOpenChange={setOpen}>
          <Suspense fallback={<LoadingSpinner />}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="project-name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="project-name"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="col-span-3"
                    placeholder="Enter project name"
                  />
                </div>
                {error && (
                  <Alert variant="destructive" className="mt-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline" type="button" disabled={isLoading}>
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="button" onClick={handleCreateProject} disabled={isLoading}>
                  {isLoading ? "Creating..." : "Create"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Suspense>
        </Dialog>
      </div>
    </Suspense>
  );
};

export default ProjectsSection;


export const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-full">
    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary"></div>
  </div>
);


export const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-300 ${className}`}></div>
);