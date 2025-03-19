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
  ChevronLeft,
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
  Tabs: lazy(() =>
    import("@/components/ui/tabs").then((mod) => ({ default: mod.Tabs }))
  ),
  TabsList: lazy(() =>
    import("@/components/ui/tabs").then((mod) => ({ default: mod.TabsList }))
  ),
  TabsTrigger: lazy(() =>
    import("@/components/ui/tabs").then((mod) => ({ default: mod.TabsTrigger }))
  ),
  TabsContent: lazy(() =>
    import("@/components/ui/tabs").then((mod) => ({ default: mod.TabsContent }))
  ),
  Select: lazy(() =>
    import("@/components/ui/select").then((mod) => ({ default: mod.Select }))
  ),
  SelectTrigger: lazy(() =>
    import("@/components/ui/select").then((mod) => ({
      default: mod.SelectTrigger,
    }))
  ),
  SelectValue: lazy(() =>
    import("@/components/ui/select").then((mod) => ({
      default: mod.SelectValue,
    }))
  ),
  SelectContent: lazy(() =>
    import("@/components/ui/select").then((mod) => ({
      default: mod.SelectContent,
    }))
  ),
  SelectItem: lazy(() =>
    import("@/components/ui/select").then((mod) => ({ default: mod.SelectItem }))
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
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} = components;

// API Functions using DocGen endpoints (unchanged)
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
  const response = await fetch(`${BASE_URL}/repositories/list-repositories?project_id=${projectId}`, {
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
  const response = await fetch(`${BASE_URL}/repositories/create-repository`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      project_id: projectId,
      name: repoData.name,
      source: repoData.source || "github",
      repo_url: repoData.url || "",
      storage_path: `/repos/${projectId}/${repoData.name
        .toLowerCase()
        .replace(/\s+/g, "-")}`,
      created_at: new Date().getTime(),
      last_generated_at: null,
      last_generated_by: null,
    }),
  });
  if (!response.ok) throw new Error("Failed to create repository");
  return await response.json();
};

const UPDATE_REPO_API = async (repo_id, updateData, token) => {
  const response = await fetch(`${BASE_URL}/repositories/update-repository/${repo_id}`, {
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

  // State hooks (updated to include localFiles)
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
  const [activeTab, setActiveTab] = useState("github");
  const [githubUsername, setGithubUsername] = useState("");
  const [githubRepos, setGithubRepos] = useState([]);
  const [selectedGithubRepo, setSelectedGithubRepo] = useState("");
  const [repoType, setRepoType] = useState("public");
  const [localFolderName, setLocalFolderName] = useState("");
  const [localFiles, setLocalFiles] = useState(null); // To store the selected folder/files

  const JWT_TOKEN = localStorage.getItem("token");

  // Fetch project and repositories on mount (unchanged)
  useEffect(() => {
    if (!JWT_TOKEN) {
      navigate("/");
      return;
    }

    const fetchData = async () => {
      setFetchingRepos(true);
      setFetchError("");
      try {
        const [projectData, reposData] = await Promise.all([
          GET_PROJECT_API(projectId, JWT_TOKEN),
          GET_REPOS_API(projectId, JWT_TOKEN)
        ]);
        setProject(projectData);
        setRepositories(reposData)
      } catch (err) {
        setFetchError(err.message || "Error fetching data. Please try again.");
      } finally {
        setFetchingRepos(false);
      }
    };
    if (projectId) fetchData();
  }, [projectId, JWT_TOKEN, navigate]);

  // Mock GitHub repository fetch based on username (unchanged)
  const fetchGithubRepos = () => {
    const mockRepos = [
      { name: "repo1", url: `https://github.com/${githubUsername}/repo1` },
      { name: "repo2", url: `https://github.com/${githubUsername}/repo2` },
      { name: "repo3", url: `https://github.com/${githubUsername}/repo3` },
    ];
    setGithubRepos(mockRepos);
  };

  // Handle folder selection and extract folder name
  const handleFolderSelect = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setLocalFiles(files);
      // Extract the folder name from the first file's webkitRelativePath
      const firstFilePath = files[0].webkitRelativePath;
      const folderName = firstFilePath.split("/")[0]; // The first part of the path is the folder name
      setLocalFolderName(folderName);
    } else {
      setLocalFiles(null);
      setLocalFolderName("");
    }
  };

  // Handle repository creation (updated to handle local file upload)
  const handleCreateRepo = async () => {
    let finalRepoName = repoName;
    let finalRepoUrl = repoUrl;
    let source = activeTab;

    if (activeTab === "local") {
      if (!localFiles || localFiles.length === 0) {
        setError("Please select a folder to upload");
        return;
      }
      finalRepoName = localFolderName; // Use folder name as repo name
      finalRepoUrl = null; // Ignore repo URL for local
      source = "local";
    } else if (activeTab === "github") {
      if (!selectedGithubRepo) {
        setError("Please select a GitHub repository to import");
        return;
      }
      finalRepoName = selectedGithubRepo;
      finalRepoUrl = githubRepos.find((repo) => repo.name === selectedGithubRepo)?.url;
    }

    if (!finalRepoName.trim()) {
      setError("Repository name cannot be empty");
      return;
    }

    if (activeTab === "github" && !finalRepoUrl) {
      setError("Repository URL cannot be empty for GitHub");
      return;
    }

    setIsLoading(true);
    setError("");
    try {
      const repoData = { name: finalRepoName, url: finalRepoUrl, source };
      const newRepo = await CREATE_REPO_API(projectId, repoData, JWT_TOKEN);
      setRepositories((prev) => [...prev, newRepo]);
      toast.success("Repository created successfully");
      setOpen(false);
      setRepoName("");
      setRepoUrl("");
      setGithubUsername("");
      setGithubRepos([]);
      setSelectedGithubRepo("");
      setLocalFolderName("");
      setLocalFiles(null);
      setActiveTab("github");
    } catch (err) {
      setError(err.message || "Error creating repository. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Placeholder for Import button (unchanged)
  const handleImportGithubRepo = () => {
    toast.info("Import functionality will be implemented later.");
  };

  // Handle repository rename (unchanged)
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

  // Handle repository delete (unchanged)
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

  // Navigate to repository details (unchanged)
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

  // UI (updated Local tab in Create Repository Dialog)
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <div className="space-y-6 p-10 mt-8">
        <header className="mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/projects`)}
            className="text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
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

        {/* Updated Create Repository Dialog */}
        <Dialog open={open} onOpenChange={setOpen}>
          <Suspense fallback={<LoadingSpinner />}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Import Repository</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="github">GitHub</TabsTrigger>
                    <TabsTrigger value="local">Local</TabsTrigger>
                  </TabsList>
                  <TabsContent value="github">
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right col-span-1">GitHub Username</Label>
                        <div className="col-span-3 flex gap-2">
                          <Input
                            value={githubUsername}
                            onChange={(e) => setGithubUsername(e.target.value)}
                            placeholder="Enter GitHub username or profile URL"
                          />
                          <Button onClick={fetchGithubRepos} disabled={!githubUsername.trim()}>
                            Search
                          </Button>
                        </div>
                      </div>
                      {githubRepos.length > 0 && (
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label className="text-right col-span-1">Repository</Label>
                          <div className="col-span-3 flex gap-2">
                            <Select
                              value={selectedGithubRepo}
                              onValueChange={setSelectedGithubRepo}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select a repository" />
                              </SelectTrigger>
                              <SelectContent>
                                {githubRepos.map((repo) => (
                                  <SelectItem key={repo.name} value={repo.name}>
                                    {repo.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Button onClick={handleImportGithubRepo}>Import</Button>
                          </div>
                        </div>
                      )}
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right col-span-1">Repository Type</Label>
                        <div className="col-span-3 flex gap-4">
                          <div className="flex items-center gap-2">
                            <input
                              type="radio"
                              id="public"
                              name="repoType"
                              value="public"
                              checked={repoType === "public"}
                              onChange={() => setRepoType("public")}
                            />
                            <Label htmlFor="public">Public</Label>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="radio"
                              id="private"
                              name="repoType"
                              value="private"
                              checked={repoType === "private"}
                              onChange={() => setRepoType("private")}
                            />
                            <Label htmlFor="private">Private (Own)</Label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="local">
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right col-span-1">Upload Folder</Label>
                        <div className="col-span-3">
                          <input
                            type="file"
                            // @ts-ignore
                            webkitdirectory="true"
                            directory=""
                            onChange={handleFolderSelect}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
                          />
                        </div>
                      </div>
                      {localFolderName && (
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label className="text-right col-span-1">Folder Name</Label>
                          <div className="col-span-3">
                            <Input
                              value={localFolderName}
                              readOnly
                              className="col-span-3 bg-gray-100 cursor-not-allowed"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
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
                  {isLoading ? "Importing..." : "Import Repository"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Suspense>
        </Dialog>

        {/* Rename and Delete Dialogs (unchanged) */}
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

// Reusable components (unchanged)
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