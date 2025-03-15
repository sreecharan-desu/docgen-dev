import { useState, lazy, Suspense } from "react";
import { Plus, FolderKanban, AlertCircle } from "lucide-react";
import { CREATE_PROJECT_API } from "@/utils/apis";
import { useNavigate } from "react-router-dom";
import { projectAtom } from "@/store/store";
import { useSetRecoilState } from "recoil";

// Lazy loading UI components
const components = {
  Button: lazy(() => import("@/components/ui/button").then((mod) => ({ default: mod.Button }))),
  Input: lazy(() => import("@/components/ui/input").then((mod) => ({ default: mod.Input }))),
  Label: lazy(() => import("@/components/ui/label").then((mod) => ({ default: mod.Label }))),
  Card: lazy(() => import("@/components/ui/card").then((mod) => ({ default: mod.Card }))),
  CardContent: lazy(() => import("@/components/ui/card").then((mod) => ({ default: mod.CardContent }))),
  Dialog: lazy(() => import("@/components/ui/dialog").then((mod) => ({ default: mod.Dialog }))),
  DialogContent: lazy(() => import("@/components/ui/dialog").then((mod) => ({ default: mod.DialogContent }))),
  DialogHeader: lazy(() => import("@/components/ui/dialog").then((mod) => ({ default: mod.DialogHeader }))),
  DialogTitle: lazy(() => import("@/components/ui/dialog").then((mod) => ({ default: mod.DialogTitle }))),
  DialogFooter: lazy(() => import("@/components/ui/dialog").then((mod) => ({ default: mod.DialogFooter }))),
  DialogClose: lazy(() => import("@/components/ui/dialog").then((mod) => ({ default: mod.DialogClose }))),
  Alert: lazy(() => import("@/components/ui/alert").then((mod) => ({ default: mod.Alert }))),
  AlertDescription: lazy(() => import("@/components/ui/alert").then((mod) => ({ default: mod.AlertDescription }))),
};

// Destructuring for cleaner usage
const {
  Button,
  Input,
  Label,
  Card,
  CardContent,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  Alert,
  AlertDescription,
} = components;

const ProjectsSection = () => {
  // State hooks
  const [open, setOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Navigation and state setters
  const navigateTo = useNavigate();
  const setProject = useSetRecoilState(projectAtom);

  // Project creation handler
  const handleCreateProject = async () => {
    if (!projectName.trim() || !projectDescription.trim()) {
      setError("Project name and description cannot be empty");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(CREATE_PROJECT_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:
            "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhMGVlYmM5OS05YzBiLTRlZjgtYmI2ZC02YmI5YmQzODBhMTEiLCJleHAiOjE3NDIwNTkyNzJ9.n_5AeyxV1gMfocPzEL1AFLvrIyZLIqHBRy23qozVX2U",
        },
        body: JSON.stringify({
          name: projectName,
          description: projectDescription,
          owner_id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
        }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Failed to create project");

      setProject(data);
      navigateTo(`/project/${data.id}`);

      setOpen(false);
      setProjectName("");
      setProjectDescription("");
    } catch (err) {
      setError(err.message || "Error processing request. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <div className="space-y-6 p-10">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Projects</h1>
          <p className="text-muted-foreground">Manage your DocGen projects</p>
        </header>

        {/* Project Card */}
        <Suspense fallback={<SkeletonCard />}>
          <Card className="overflow-hidden">
            <div className="h-1 bg-primary/20"></div>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="rounded-full bg-primary/10 p-3 mb-4">
                <FolderKanban className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Projects</h3>
              <p className="text-muted-foreground text-center mb-4">
                Create and manage your projects here.
              </p>
              <Button variant="outline" onClick={() => setOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Project
              </Button>
            </CardContent>
          </Card>
        </Suspense>

        {/* Create Project Dialog */}
        <Dialog open={open} onOpenChange={setOpen}>
          <Suspense fallback={<LoadingSpinner />}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <InputField label="Name" value={projectName} setValue={setProjectName} />
                <InputField label="Description" value={projectDescription} setValue={setProjectDescription} />
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

// 🛠️ Reusable Input Field Component
const InputField = ({ label, value, setValue }) => (
  <div className="grid grid-cols-4 items-center gap-4">
    <Label className="text-right">{label}</Label>
    <Input value={value} onChange={(e) => setValue(e.target.value)} className="col-span-3" />
  </div>
);

// 🔄 Loading Spinner
const LoadingSpinner = () => <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary"></div>;

// 🦴 Skeleton Card
const SkeletonCard = () => <div className="animate-pulse bg-gray-300 h-32 w-full rounded-lg"></div>;
