import { useState, useEffect, lazy, Suspense } from "react";
import { Plus, FolderKanban, AlertCircle, Clock, Users, GitBranch, ArrowUpRight } from "lucide-react";
import { CREATE_PROJECT_API } from "@/utils/apis";
import { useNavigate } from "react-router-dom";
import { projectAtom } from "@/store/store";
import { useSetRecoilState } from "recoil";
import { useAuth } from "@/contexts/AuthContext";

// Lazy loading UI components
const components = {
  Button: lazy(() => import("@/components/ui/button").then((mod) => ({ default: mod.Button }))),
  Input: lazy(() => import("@/components/ui/input").then((mod) => ({ default: mod.Input }))),
  Label: lazy(() => import("@/components/ui/label").then((mod) => ({ default: mod.Label }))),
  Card: lazy(() => import("@/components/ui/card").then((mod) => ({ default: mod.Card }))),
  CardContent: lazy(() => import("@/components/ui/card").then((mod) => ({ default: mod.CardContent }))),
  CardHeader: lazy(() => import("@/components/ui/card").then((mod) => ({ default: mod.CardHeader }))),
  CardTitle: lazy(() => import("@/components/ui/card").then((mod) => ({ default: mod.CardTitle }))),
  CardDescription: lazy(() => import("@/components/ui/card").then((mod) => ({ default: mod.CardDescription }))),
  CardFooter: lazy(() => import("@/components/ui/card").then((mod) => ({ default: mod.CardFooter }))),
  Dialog: lazy(() => import("@/components/ui/dialog").then((mod) => ({ default: mod.Dialog }))),
  DialogContent: lazy(() => import("@/components/ui/dialog").then((mod) => ({ default: mod.DialogContent }))),
  DialogHeader: lazy(() => import("@/components/ui/dialog").then((mod) => ({ default: mod.DialogHeader }))),
  DialogTitle: lazy(() => import("@/components/ui/dialog").then((mod) => ({ default: mod.DialogTitle }))),
  DialogFooter: lazy(() => import("@/components/ui/dialog").then((mod) => ({ default: mod.DialogFooter }))),
  DialogClose: lazy(() => import("@/components/ui/dialog").then((mod) => ({ default: mod.DialogClose }))),
  Alert: lazy(() => import("@/components/ui/alert").then((mod) => ({ default: mod.Alert }))),
  AlertDescription: lazy(() => import("@/components/ui/alert").then((mod) => ({ default: mod.AlertDescription }))),
  Badge: lazy(() => import("@/components/ui/badge").then((mod) => ({ default: mod.Badge }))),
};

// Destructuring for cleaner usage
const {
  Button,
  Input,
  Label,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  Alert,
  AlertDescription,
  Badge,
} = components;

const ProjectsSection = () => {
  // State hooks
  const [open, setOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [projects, setProjects] = useState([]);
  const [fetchingProjects, setFetchingProjects] = useState(true);
  const [fetchError, setFetchError] = useState("");

  const user = useAuth();
  const navigateTo = useNavigate();
  const setProject = useSetRecoilState(projectAtom);

  // Fetch projects on component mount
  useEffect(() => {
    fetchProjects();
  }, []);

  // Function to fetch projects
  const fetchProjects = async () => {
    setFetchingProjects(true);
    setFetchError("");

    try {
      const response = await fetch("https://api2.docgen.dev/api/v1/project/list-projects", {
        method : 'GET',
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });

      if (!response.ok) {
        throw new Error("Failed to fetch projects");
      }

      const data = await response.json();
      setProjects(data);
    } catch (err) {
      setFetchError(err.message || "Error fetching projects. Please try again.");
    } finally {
      setFetchingProjects(false);
    }
  };

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
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          name: projectName,
          description: projectDescription,
          owner_id: user.user.id,
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

  // Format date for display
  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = new Date(Number(timestamp));
    return isNaN(date.getTime()) ? "N/A" : date.toLocaleDateString("en-US", {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Navigate to project details
  const goToProject = (projectId) => {
    const selectedProject = projects.find(p => p.id === projectId);
    if (selectedProject) {
      setProject(selectedProject);
      navigateTo(`/project/${projectId}`);
    }
  };

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <div className="space-y-6 p-10">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Projects</h1>
            <p className="text-muted-foreground">Manage your DocGen projects</p>
          </div>
          <Button onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Project
          </Button>
        </header>

        {/* Error Alert */}
        {fetchError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4 mr-2" />
            <AlertDescription>{fetchError}</AlertDescription>
          </Alert>
        )}

        {/* Projects Grid */}
        <Suspense fallback={<ProjectsGridSkeleton />}>
          {fetchingProjects ? (
            <ProjectsGridSkeleton />
          ) : projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <Card
                  key={project.id}
                  className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => goToProject(project.id)}
                >
                  <div className="h-1 bg-primary"></div>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex justify-between items-center">
                      <span className="truncate">{project.name}</span>
                      <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                    </CardTitle>
                    <CardDescription className="truncate">{project.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="flex items-center text-sm text-muted-foreground mb-2">
                      <Clock className="h-4 w-4 mr-1" />
                      <div>Created: {formatDate(project.created_at)}</div>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 mr-1" />
                      <div>Updated: {formatDate(project.updated_at) || "Never"}</div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <div className="flex justify-between w-full">
                      <div className="flex items-center">
                        <GitBranch className="h-4 w-4 mr-1" />
                        <Badge variant="outline">{project.repo_count} repos</Badge>
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        <Badge variant="outline">{project.collaborator_count} collaborators</Badge>
                      </div>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyProjectState setOpen={setOpen} />
          )}
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
const LoadingSpinner = () => <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary mx-auto"></div>;

// 🦴 Project Grid Skeleton
const ProjectsGridSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {[1, 2, 3].map(i => (
      <div key={i} className="animate-pulse">
        <div className="h-1 bg-gray-300 w-full"></div>
        <div className="p-6 space-y-4">
          <div className="h-5 bg-gray-300 rounded w-3/4"></div>
          <div className="h-4 bg-gray-300 rounded w-full"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
          </div>
          <div className="flex justify-between pt-2">
            <div className="h-6 bg-gray-300 rounded w-1/4"></div>
            <div className="h-6 bg-gray-300 rounded w-1/4"></div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

// Empty State Component
const EmptyProjectState = ({ setOpen }) => (
  <Card className="overflow-hidden">
    <div className="h-1 bg-primary/20"></div>
    <CardContent className="flex flex-col items-center justify-center py-12">
      <div className="rounded-full bg-primary/10 p-3 mb-4">
        <FolderKanban className="h-6 w-6 text-primary" />
      </div>
      <h3 className="text-lg font-semibold mb-2">No Projects Yet</h3>
      <p className="text-muted-foreground text-center mb-4">
        Create your first project to get started.
      </p>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4 mr-2" />
        Create Project
      </Button>
    </CardContent>
  </Card>
);