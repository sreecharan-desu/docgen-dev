import { useState, useEffect, lazy, Suspense } from "react";
import {
  Plus,
  FolderKanban,
  AlertCircle,
  Clock,
  Users,
  GitBranch,
  Search,
  X,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { projectAtom } from "@/store/store";
import { useSetRecoilState } from "recoil";
import { useAuth } from "@/contexts/AuthContext";
import { useDebounce } from "use-debounce";

// Lazy loading UI components (unchanged)
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
  DropdownMenu: lazy(() => import("@/components/ui/dropdown-menu").then((mod) => ({ default: mod.DropdownMenu }))),
  DropdownMenuTrigger: lazy(() => import("@/components/ui/dropdown-menu").then((mod) => ({ default: mod.DropdownMenuTrigger }))),
  DropdownMenuContent: lazy(() => import("@/components/ui/dropdown-menu").then((mod) => ({ default: mod.DropdownMenuContent }))),
  DropdownMenuItem: lazy(() => import("@/components/ui/dropdown-menu").then((mod) => ({ default: mod.DropdownMenuItem }))),
  DropdownMenuSeparator: lazy(() => import("@/components/ui/dropdown-menu").then((mod) => ({ default: mod.DropdownMenuSeparator }))),
};

// Destructuring for cleaner usage (unchanged)
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
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} = components;

// API Base URL
const BASE_URL = "https://api2.docgen.dev/api/v1/project";


// API Functions
const fetchProjects = async (token) => {
  const response = await fetch(`${BASE_URL}/list-projects`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) throw new Error("Failed to fetch projects");
  return await response.json();
};

const createProject = async (projectData, token) => {
  const response = await fetch(`${BASE_URL}/create-project`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(projectData),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to create project");
  }
  return await response.json();
};

const renameProject = async (projectId, newName, token) => {
  const response = await fetch(`${BASE_URL}/update-project/${projectId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name: newName }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to rename project");
  }
  return await response.json();
};

const deleteProject = async (projectId, token) => {
  const response = await fetch(`${BASE_URL}/delete-project/${projectId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to delete project");
  }
  return await response.json();
};

const ProjectsSection = () => {
  // State hooks (unchanged)
  const [open, setOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [newProjectName, setNewProjectName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [projects, setProjects] = useState([]);
  const [fetchingProjects, setFetchingProjects] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [selectedProject, setSelectedProject] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);

  const { user } = useAuth();
  const navigateTo = useNavigate();
  const setProject = useSetRecoilState(projectAtom);
  const token = localStorage.getItem("token");

  // Fetch projects on component mount
  useEffect(() => {
    const getProjects = async () => {
      setFetchingProjects(true);
      setFetchError("");
      try {
        const data = await fetchProjects(token);
        setProjects(data);
      } catch (err) {
        setFetchError(
          `Error fetching projects. Please try again.`
        );

      } finally {
        setFetchingProjects(false);
      }
    };
    if (token) getProjects();
    else navigateTo("/"); // Redirect if no token
  }, [token, navigateTo]);

  const handleCreateProject = async () => {
    if (!projectName.trim() || !projectDescription.trim()) {
      setError("Project name and description cannot be empty");
      return;
    }

    setIsLoading(true);
    setError("");
    try {
      const projectData = {
        name: projectName,
        description: projectDescription,
        owner_id: user?.id,
      };
      const newProject = await createProject(projectData, token);
      setProject(newProject);
      navigateTo(`/project/${newProject.id}`);
      setOpen(false);
      setProjectName("");
      setProjectDescription("");
    } catch (err) {
      setError(err.message || "Error creating project. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRenameProject = async () => {
    if (!newProjectName.trim()) {
      setError("Project name cannot be empty");
      return;
    }

    setIsLoading(true);
    setError("");
    try {
      const updatedProject = await renameProject(selectedProject.id, newProjectName, token);
      setProjects(projects.map((p) =>
        p.id === selectedProject.id ? updatedProject : p
      ));
      setRenameOpen(false);
      setNewProjectName("");
      setSelectedProject(null);
    } catch (err) {
      setError(err.message || "Error renaming project. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProject = async () => {
    setIsLoading(true);
    setError("");
    try {
      await deleteProject(selectedProject.id, token);
      setProjects(projects.filter((p) => p.id !== selectedProject.id));
      setDeleteOpen(false);
      setSelectedProject(null);
    } catch (err) {
      setError(err.message || "Error deleting project. Please try again.");
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

  const openRenameDialog = (project, e) => {
    e.stopPropagation();
    setSelectedProject(project);
    setNewProjectName(project.name);
    setRenameOpen(true);
  };

  const openDeleteDialog = (project, e) => {
    e.stopPropagation();
    setSelectedProject(project);
    setDeleteOpen(true);
  };

  // Filter projects based on search (removed status filter as it's not used with new APIs)
  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
    project.description.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
  );

  // UI remains completely unchanged
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <div className="space-y-6 p-10 mt-8">
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

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-10 w-full"
              />
              {searchTerm && (
                <X
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground cursor-pointer"
                  onClick={() => setSearchTerm("")}
                />
              )}
            </div>
          </div>
        </header>

        {fetchError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4 mr-2" />
            <AlertDescription dangerouslySetInnerHTML={{ __html: fetchError }} />
          </Alert>
        )}

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
                  <CardHeader className="pb-3">
                    <CardTitle className="flex justify-between items-center text-lg font-semibold text-foreground">
                      <span className="truncate">{project.name}</span>
                      <Suspense fallback={<div className="h-5 w-5"></div>}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => openRenameDialog(project, e)}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Rename
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive" onClick={(e) => openDeleteDialog(project, e)}>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </Suspense>
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

        <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
          <Suspense fallback={<LoadingSpinner />}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Rename Project</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <InputField
                  label="New Name"
                  value={newProjectName}
                  setValue={setNewProjectName}
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
                  onClick={handleRenameProject}
                  disabled={isLoading}
                >
                  {isLoading ? "Renaming..." : "Rename"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Suspense>
        </Dialog>

        <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <Suspense fallback={<LoadingSpinner />}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Delete Project</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <p className="text-muted-foreground">
                  Are you sure you want to delete project <span className="font-semibold">{selectedProject?.name}</span>? This action cannot be undone.
                </p>
                {error && (
                  <Alert variant="destructive" className="mt-4">
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
                  variant="destructive"
                  onClick={handleDeleteProject}
                  disabled={isLoading}
                >
                  {isLoading ? "Deleting..." : "Delete"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Suspense>
        </Dialog>
      </div>
    </Suspense>
  );
};

// Reusable components remain unchanged
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

const LoadingSpinner = () => (
  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary mx-auto"></div>
);

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