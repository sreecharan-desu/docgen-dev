import { useState, useEffect, lazy, Suspense } from "react";
import {
  Plus,
  FolderKanban,
  AlertCircle,
  Clock,
  Users,
  GitBranch,
  ArrowUpRight,
  Search,
  Filter,
} from "lucide-react";
import { CREATE_PROJECT_API } from "@/utils/apis";
import { useNavigate } from "react-router-dom";
import { projectAtom } from "@/store/store";
import { useSetRecoilState } from "recoil";
import { useAuth } from "@/contexts/AuthContext";
import { useDebounce } from "use-debounce";
import { DialogHeader } from "@/components/ui/dialog";

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
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);

  const user = useAuth();
  const navigateTo = useNavigate();
  const setProject = useSetRecoilState(projectAtom);

  // Fetch projects on component mount
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setFetchingProjects(true);
    setFetchError("");

    try {
      const response = await fetch(
        "https://api2.docgen.dev/api/v1/project/list-projects",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

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
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          name: projectName,
          description: projectDescription,
          owner_id: user.user.id,
        }),
      });

      const data = await response.json();

      if (!response.ok)
        throw new Error(data.message || "Failed to create project");

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

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = new Date(Number(timestamp));
    return isNaN(date.getTime())
      ? "N/A"
      : date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
  };

  const goToProject = (projectId) => {
    const selectedProject = projects.find((p) => p.id === projectId);
    if (selectedProject) {
      setProject(selectedProject);
      navigateTo(`/project/${projectId}`);
    }
  };

  // Filter projects based on search and status
  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
    
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && project.is_active !== false) ||
      (statusFilter === "inactive" && project.is_active === false);

    return matchesSearch && matchesStatus;
  });

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <div className="space-y-6 p-10">
        <header className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Projects</h1>
              <p className="text-muted-foreground">Manage your DocGen projects</p>
            </div>
            <Button onClick={() => setOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Project
            </Button>
          </div>

          {/* Search and Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-border rounded-md px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Projects</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
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
          ) : filteredProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <Card
                  key={project.id}
                  className="overflow-hidden shadow-lg transition-all duration-300 ease-in-out hover:shadow-xl hover:scale-[1.02] cursor-pointer border border-border bg-background rounded-2xl"
                  onClick={() => goToProject(project.id)}
                >
                  {/* <div className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div> */}
                  <CardHeader className="pb-3">
                    <CardTitle className="flex justify-between items-center text-lg font-semibold text-foreground">
                      <span className="truncate">{project.name}</span>
                      <ArrowUpRight className="h-5 w-5 text-muted-foreground transition-transform duration-200 group-hover:translate-x-1 group-hover:-translate-y-1" />
                    </CardTitle>
                    <CardDescription className="truncate text-muted-foreground text-sm">
                      {project.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-3 space-y-2">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 mr-1 text-primary" />
                      <div>Created: {formatDate(project.created_at)}</div>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 mr-1 text-primary" />
                      <div>Updated: {formatDate(project.updated_at) || "Never"}</div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2 border-t border-border bg-muted/40 rounded-b-2xl">
                    <div className="flex justify-between w-full text-sm">
                      <div className="flex items-center gap-1">
                        <GitBranch className="h-4 w-4 text-primary" />
                        <Badge variant="outline" className="px-2 py-1 text-xs font-medium">
                          {project.repo_count} repos
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-primary" />
                        <Badge variant="outline" className="px-2 py-1 text-xs font-medium">
                          {project.collaborator_count} collaborators
                        </Badge>
                      </div>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : projects.length > 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No projects match your search criteria
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
                <InputField
                  label="Name"
                  value={projectName}
                  setValue={setProjectName}
                />
                <InputField
                  label="Description"
                  value={projectDescription}
                  setValue={setProjectDescription}
                />
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
                <Button
                  type="button"
                  onClick={handleCreateProject}
                  disabled={isLoading}
                >
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

// Reusable Input Field Component
const InputField = ({ label, value, setValue }) => (
  <div className="grid grid-cols-4 items-center gap-4">
    <Label className="text-right">{label}</Label>
    <Input
      value={value}
      onChange={(e) => setValue(e.target.value)}
      className="col-span-3"
    />
  </div>
);

// Loading Spinner
const LoadingSpinner = () => (
  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary mx-auto"></div>
);

// Project Grid Skeleton
const ProjectsGridSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {[1, 2, 3].map((i) => (
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

export default ProjectsSection;