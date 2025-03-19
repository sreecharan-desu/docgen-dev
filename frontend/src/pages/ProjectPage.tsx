import { useParams } from "react-router-dom";
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
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useDebounce } from "use-debounce";

// Lazy-loaded UI components (unchanged)
const components = {
  Button: lazy(() =>
    import("@/components/ui/button").then((mod) => ({ default: mod.Button }))
  ),
  Input: lazy(() =>
    import("@/components/ui/input").then((mod) => ({ default: mod.Input }))
  ),
  Label: lazy(() =>
    import("@/components/ui/label").then((mod) => ({ default: mod.Label }))
  ),
  Card: lazy(() =>
    import("@/components/ui/card").then((mod) => ({ default: mod.Card }))
  ),
  CardContent: lazy(() =>
    import("@/components/ui/card").then((mod) => ({ default: mod.CardContent }))
  ),
  CardHeader: lazy(() =>
    import("@/components/ui/card").then((mod) => ({ default: mod.CardHeader }))
  ),
  CardTitle: lazy(() =>
    import("@/components/ui/card").then((mod) => ({ default: mod.CardTitle }))
  ),
  CardDescription: lazy(() =>
    import("@/components/ui/card").then((mod) => ({
      default: mod.CardDescription,
    }))
  ),
  CardFooter: lazy(() =>
    import("@/components/ui/card").then((mod) => ({ default: mod.CardFooter }))
  ),
  Dialog: lazy(() =>
    import("@/components/ui/dialog").then((mod) => ({ default: mod.Dialog }))
  ),
  DialogContent: lazy(() =>
    import("@/components/ui/dialog").then((mod) => ({
      default: mod.DialogContent,
    }))
  ),
  DialogHeader: lazy(() =>
    import("@/components/ui/dialog").then((mod) => ({
      default: mod.DialogHeader,
    }))
  ),
  DialogTitle: lazy(() =>
    import("@/components/ui/dialog").then((mod) => ({
      default: mod.DialogTitle,
    }))
  ),
  DialogFooter: lazy(() =>
    import("@/components/ui/dialog").then((mod) => ({
      default: mod.DialogFooter,
    }))
  ),
  DialogClose: lazy(() =>
    import("@/components/ui/dialog").then((mod) => ({
      default: mod.DialogClose,
    }))
  ),
  Alert: lazy(() =>
    import("@/components/ui/alert").then((mod) => ({ default: mod.Alert }))
  ),
  AlertDescription: lazy(() =>
    import("@/components/ui/alert").then((mod) => ({
      default: mod.AlertDescription,
    }))
  ),
  Badge: lazy(() =>
    import("@/components/ui/badge").then((mod) => ({ default: mod.Badge }))
  ),
  DropdownMenu: lazy(() =>
    import("@/components/ui/dropdown-menu").then((mod) => ({
      default: mod.DropdownMenu,
    }))
  ),
  DropdownMenuTrigger: lazy(() =>
    import("@/components/ui/dropdown-menu").then((mod) => ({
      default: mod.DropdownMenuTrigger,
    }))
  ),
  DropdownMenuContent: lazy(() =>
    import("@/components/ui/dropdown-menu").then((mod) => ({
      default: mod.DropdownMenuContent,
    }))
  ),
  DropdownMenuItem: lazy(() =>
    import("@/components/ui/dropdown-menu").then((mod) => ({
      default: mod.DropdownMenuItem,
    }))
  ),
  DropdownMenuSeparator: lazy(() =>
    import("@/components/ui/dropdown-menu").then((mod) => ({
      default: mod.DropdownMenuSeparator,
    }))
  ),
};

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

// API Functions using DocGen endpoints
const BASE_URL = "https://api2.docgen.dev/api/v1";

const GET_PROJECT_API = async (projectId, token) => {
  const response = await fetch(`${BASE_URL}/project/get-project/${projectId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) throw new Error("Failed to fetch project data");
  const data = await response.json();
  return {
    name: data.name,
    id: data.id,
    collaborators: data.collaborator_count,
  };
};

const GET_REPOS_API = async (projectId, token) => {
  const response = await fetch(`${BASE_URL}/list-repositories/${projectId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) throw new Error("Failed to fetch repositories");
  return await response.json();
};

const CREATE_REPO_API = async (projectId, repoData, token) => {
  const response = await fetch(`${BASE_URL}/repo/create-repository`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      project_id: projectId,
      name: repoData.name,
      source: "github",
      repo_url: repoData.url,
      storage_path: `/repos/${projectId}/${repoData.name
        .toLowerCase()
        .replace(/\s+/g, "-")}`,
      created_at: new Date().toISOString(),
      last_generated_at: null,
      last_generated_by: null,
    }),
  });
  if (!response.ok) throw new Error("Failed to create repository");
  return await response.json();
};

const UPDATE_REPO_API = async (repoId, updateData, token) => {
  const response = await fetch(`${BASE_URL}/update-repository/${repoId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: updateData.name,
      source: "github",
    }),
  });
  if (!response.ok) throw new Error("Failed to update repository");
  return await response.json();
};

const DELETE_REPO_API = async (repoId, token) => {
  const response = await fetch(`${BASE_URL}/delete-repository/${repoId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) throw new Error("Failed to delete repository");
  return await response.json();
};

const ProjectPage = () => {
  const { id: projectId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  // State hooks (unchanged)
  const [open, setOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [repoName, setRepoName] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [newRepoName, setNewRepoName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [project, setProject] = useState(null);
  const [repositories, setRepositories] = useState([]);
  const [fetchingRepos, setFetchingRepos] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);

  const JWT_TOKEN = localStorage.getItem("token");

  // Fetch project and repositories on mount
  useEffect(() => {
    if (!JWT_TOKEN) {
      navigate("/");
      return;
    }
    const fetchData = async () => {
      setFetchingRepos(true);
      setFetchError("");
      try {
        const [projectData] = await Promise.all([
          GET_PROJECT_API(projectId, JWT_TOKEN),
          // GET_REPOS_API(projectId, JWT_TOKEN),
        ]);
        console.log(projectData);
        setProject(projectData);
        // setRepositories(repoData);
      } catch (err) {
        setFetchError(err.message || "Error fetching data. Please try again.");
      } finally {
        setFetchingRepos(false);
      }
    };
    if (projectId) fetchData();
  }, [projectId, JWT_TOKEN, navigate]);

  // Handle repository creation
  const handleCreateRepo = async () => {
    if (!repoName.trim() || !repoUrl.trim()) {
      setError("Repository name and URL cannot be empty");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      const repoData = { name: repoName, url: repoUrl };
      const newRepo = await CREATE_REPO_API(projectId, repoData, JWT_TOKEN);
      setRepositories((prev) => [...prev, newRepo]);
      toast.success("Repository created successfully");
      setOpen(false);
      setRepoName("");
      setRepoUrl("");
    } catch (err) {
      setError(err.message || "Error creating repository. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle repository rename
  const handleRenameRepo = async () => {
    if (!newRepoName.trim()) {
      setError("Repository name cannot be empty");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      const updatedRepo = await UPDATE_REPO_API(
        selectedRepo.id,
        { name: newRepoName },
        JWT_TOKEN
      );
      setRepositories((prev) =>
        prev.map((r) => (r.id === selectedRepo.id ? updatedRepo : r))
      );
      toast.success("Repository renamed successfully");
      setRenameOpen(false);
      setNewRepoName("");
      setSelectedRepo(null);
    } catch (err) {
      setError(err.message || "Error renaming repository. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle repository delete
  const handleDeleteRepo = async () => {
    setIsLoading(true);
    setError("");
    try {
      await DELETE_REPO_API(selectedRepo.id, JWT_TOKEN);
      setRepositories((prev) => prev.filter((r) => r.id !== selectedRepo.id));
      toast.success("Repository deleted successfully");
      setDeleteOpen(false);
      setSelectedRepo(null);
    } catch (err) {
      setError(err.message || "Error deleting repository. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Format date (unchanged)
  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = new Date(timestamp);
    return isNaN(date.getTime())
      ? "N/A"
      : date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
  };

  // Navigate to repository details
  const goToRepo = (repoId) => {
    navigate(`/repo/${repoId}`);
    const repo = repositories.find((r) => r.id === repoId);
    if (repo) toast.info(`Navigated to repository: ${repo.name}`);
  };

  const openRenameDialog = (repo, e) => {
    e.stopPropagation();
    setSelectedRepo(repo);
    setNewRepoName(repo.name);
    setRenameOpen(true);
  };

  const openDeleteDialog = (repo, e) => {
    e.stopPropagation();
    setSelectedRepo(repo);
    setDeleteOpen(true);
  };

  // Filter repositories (unchanged)
  const filteredRepos = repositories.filter(
    (repo) =>
      repo.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      (repo.repo_url &&
        repo.repo_url.toLowerCase().includes(debouncedSearchTerm.toLowerCase()))
  );

  // UI remains completely unchanged
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <div className="space-y-6 p-10 mt-8">
        <header className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {project?.name || "Repositories"}
              </h1>
              <p className="text-muted-foreground">
                Manage your project repositories
              </p>
            </div>
            <Button onClick={() => setOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Repository
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search repositories..."
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
            <AlertDescription>{fetchError}</AlertDescription>
          </Alert>
        )}

        <Suspense fallback={<ProjectsGridSkeleton />}>
          {fetchingRepos ? (
            <ProjectsGridSkeleton />
          ) : filteredRepos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRepos.map((repo) => (
                <Card
                  key={repo.id}
                  className="overflow-hidden shadow-lg transition-all duration-300 ease-in-out hover:shadow-xl hover:scale-[1.02] cursor-pointer border border-border bg-background rounded-2xl"
                  onClick={() => goToRepo(repo.id)}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="flex justify-between items-center text-lg font-semibold text-foreground">
                      <span className="truncate">{repo.name}</span>
                      <Suspense fallback={<div className="h-5 w-5"></div>}>
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            asChild
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={(e) => openRenameDialog(repo, e)}
                            >
                              <Pencil className="h-4 w-4 mr-2" />
                              Rename
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={(e) => openDeleteDialog(repo, e)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </Suspense>
                    </CardTitle>
                    <CardDescription className="truncate text-muted-foreground text-sm">
                      {repo.repo_url || "No URL provided"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-3 space-y-2">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 mr-1 text-primary" />
                      <div>Created: {formatDate(repo.created_at)}</div>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 mr-1 text-primary" />
                      <div>
                        Updated: {formatDate(repo.last_generated_at) || "Never"}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2 border-t border-border bg-muted/40 rounded-b-2xl">
                    <div className="flex justify-between w-full text-sm">
                      <div className="flex items-center gap-1">
                        <GitBranch className="h-4 w-4 text-primary" />
                        <Badge
                          variant="outline"
                          className="px-2 py-1 text-xs font-medium"
                        >
                          N/A files
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-primary" />
                        <Badge
                          variant="outline"
                          className="px-2 py-1 text-xs font-medium"
                        >
                          {project?.collaborators || 0} collaborators
                        </Badge>
                      </div>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : repositories.length > 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No repositories match your search criteria
            </div>
          ) : (
            <EmptyRepoState setOpen={setOpen} />
          )}
        </Suspense>

        <Dialog open={open} onOpenChange={setOpen}>
          <Suspense fallback={<LoadingSpinner />}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Repository</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <InputField
                  label="Name"
                  value={repoName}
                  setValue={setRepoName}
                />
                <InputField label="URL" value={repoUrl} setValue={setRepoUrl} />
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
                  onClick={handleCreateRepo}
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
                <DialogTitle>Rename Repository</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <InputField
                  label="New Name"
                  value={newRepoName}
                  setValue={setNewRepoName}
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
                  onClick={handleRenameRepo}
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
                <DialogTitle>Delete Repository</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <p className="text-muted-foreground">
                  Are you sure you want to delete repository{" "}
                  <span className="font-semibold">{selectedRepo?.name}</span>?
                  This action cannot be undone.
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
                  onClick={handleDeleteRepo}
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

const EmptyRepoState = ({ setOpen }) => (
  <Card className="overflow-hidden">
    <div className="h-1 bg-primary/20"></div>
    <CardContent className="flex flex-col items-center justify-center py-12">
      <div className="rounded-full bg-primary/10 p-3 mb-4">
        <FolderKanban className="h-6 w-6 text-primary" />
      </div>
      <h3 className="text-lg font-semibold mb-2">No Repositories Yet</h3>
      <p className="text-muted-foreground text-center mb-4">
        Create your first repository to get started.
      </p>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4 mr-2" />
        Create Repository
      </Button>
    </CardContent>
  </Card>
);

export default ProjectPage;
