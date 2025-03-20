import { useParams } from "react-router-dom";
import React, { useState, useEffect, useCallback, memo, Suspense } from "react";
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
  RefreshCw,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useDebounce } from "use-debounce";

// Lazy-loaded UI components
const Button = React.lazy(() => import("@/components/ui/button").then(mod => ({ default: mod.Button })));
const Input = React.lazy(() => import("@/components/ui/input").then(mod => ({ default: mod.Input })));
const Label = React.lazy(() => import("@/components/ui/label").then(mod => ({ default: mod.Label })));
const Card = React.lazy(() => import("@/components/ui/card").then(mod => ({ default: mod.Card })));
const CardContent = React.lazy(() => import("@/components/ui/card").then(mod => ({ default: mod.CardContent })));
const CardHeader = React.lazy(() => import("@/components/ui/card").then(mod => ({ default: mod.CardHeader })));
const CardTitle = React.lazy(() => import("@/components/ui/card").then(mod => ({ default: mod.CardTitle })));
const CardDescription = React.lazy(() => import("@/components/ui/card").then(mod => ({ default: mod.CardDescription })));
const CardFooter = React.lazy(() => import("@/components/ui/card").then(mod => ({ default: mod.CardFooter })));
const Dialog = React.lazy(() => import("@/components/ui/dialog").then(mod => ({ default: mod.Dialog })));
const DialogContent = React.lazy(() => import("@/components/ui/dialog").then(mod => ({ default: mod.DialogContent })));
const DialogHeader = React.lazy(() => import("@/components/ui/dialog").then(mod => ({ default: mod.DialogHeader })));
const DialogTitle = React.lazy(() => import("@/components/ui/dialog").then(mod => ({ default: mod.DialogTitle })));
const DialogFooter = React.lazy(() => import("@/components/ui/dialog").then(mod => ({ default: mod.DialogFooter })));
const DialogClose = React.lazy(() => import("@/components/ui/dialog").then(mod => ({ default: mod.DialogClose })));
const Alert = React.lazy(() => import("@/components/ui/alert").then(mod => ({ default: mod.Alert })));
const AlertDescription = React.lazy(() => import("@/components/ui/alert").then(mod => ({ default: mod.AlertDescription })));
const Badge = React.lazy(() => import("@/components/ui/badge").then(mod => ({ default: mod.Badge })));
const DropdownMenu = React.lazy(() => import("@/components/ui/dropdown-menu").then(mod => ({ default: mod.DropdownMenu })));
const DropdownMenuTrigger = React.lazy(() => import("@/components/ui/dropdown-menu").then(mod => ({ default: mod.DropdownMenuTrigger })));
const DropdownMenuContent = React.lazy(() => import("@/components/ui/dropdown-menu").then(mod => ({ default: mod.DropdownMenuContent })));
const DropdownMenuItem = React.lazy(() => import("@/components/ui/dropdown-menu").then(mod => ({ default: mod.DropdownMenuItem })));
const DropdownMenuSeparator = React.lazy(() => import("@/components/ui/dropdown-menu").then(mod => ({ default: mod.DropdownMenuSeparator })));
const Tabs = React.lazy(() => import("@/components/ui/tabs").then(mod => ({ default: mod.Tabs })));
const TabsList = React.lazy(() => import("@/components/ui/tabs").then(mod => ({ default: mod.TabsList })));
const TabsTrigger = React.lazy(() => import("@/components/ui/tabs").then(mod => ({ default: mod.TabsTrigger })));
const TabsContent = React.lazy(() => import("@/components/ui/tabs").then(mod => ({ default: mod.TabsContent })));

// API utility with retry logic
const apiCall = async (url, options, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      return await response.json();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
};

const BASE_URL = "https://api2.docgen.dev/api/v1";

const deepEqual = (obj1, obj2) => {
  if (obj1 === obj2) return true;
  if (!obj1 || !obj2 || typeof obj1 !== 'object' || typeof obj2 !== 'object') return false;
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  if (keys1.length !== keys2.length) return false;
  return keys1.every(key => deepEqual(obj1[key], obj2[key]));
};

const formatDate = (timestamp) => {
  if (!timestamp) return "N/A";
  const date = new Date(timestamp);
  return isNaN(date.getTime()) ? "N/A" : date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
};

const ProjectPage = memo(() => {
  const { id: projectId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [debouncedSearchTerm] = useDebounce(state => state.searchTerm, 300); // Will fix below

  const [state, setState] = useState({
    open: false,
    renameOpen: false,
    deleteOpen: false,
    repoName: "",
    repoUrl: "",
    newRepoName: "",
    isLoading: false,
    errors: {},
    project: null,
    repositories: [],
    hasFetched: false,
    selectedRepo: null,
    searchTerm: "",
    activeTab: "github",
    githubRepos: [],
    repoType: "public",
    localFolderName: "",
    localFiles: null,
    hasGithubAccess: false,
    installationId: null,
  });

  const checkGithubAccess = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }
    try {
      const response = await apiCall(`${BASE_URL}/github/check-repo-access`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      setState(prev => ({
        ...prev,
        hasGithubAccess: response.has_access,
        installationId: response.installation_id,
      }));
      if (!response.has_access) {
        toast.info("Please authorize GitHub access to import repositories");
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        errors: { githubAccess: "Failed to check GitHub access: " + error.message },
      }));
    }
  }, [navigate]);

  const fetchGithubRepos = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      const accessCheck = await apiCall(`${BASE_URL}/github/check-repo-access`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      if (!accessCheck.has_access) {
        window.location.href = `${BASE_URL}/github/authorize-app`;
        return;
      }
      const response = await apiCall(`${BASE_URL}/github/repositories`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      const formattedRepos = response.repositories.map(repo => ({
        name: repo.name,
        url: repo.html_url,
        full_name: repo.full_name,
        visibility: repo.visibility,
      }));
      setState(prev => ({
        ...prev,
        githubRepos: formattedRepos,
        isLoading: false,
        installationId: response.installation_id,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        errors: { github: "Failed to fetch GitHub repositories: " + error.message },
        isLoading: false,
      }));
      toast.error("Failed to fetch GitHub repositories");
    }
  }, []);

  const fetchProjectData = useCallback(async (force = false) => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }
    try {
      const [projectData, reposData] = await Promise.all([
        apiCall(`${BASE_URL}/project/get-project/${projectId}`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        }),
        apiCall(`${BASE_URL}/repositories/list-repositories?project_id=${projectId}`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        }),
      ]);
      setState(prev => {
        const newProject = { name: projectData.name, id: projectData.id, collaborators: projectData.collaborator_count };
        if (force || !deepEqual(prev.project, newProject) || !deepEqual(prev.repositories, reposData)) {
          return { ...prev, project: newProject, repositories: reposData, hasFetched: true };
        }
        return { ...prev, hasFetched: true };
      });
    } catch (err) {
      setState(prev => ({ ...prev, errors: { fetch: err.message || "Error fetching data" }, hasFetched: true }));
    }
  }, [projectId, navigate]);

  const handleCreateRepo = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    if (state.activeTab === "github" && !state.hasGithubAccess) {
      setState(prev => ({ ...prev, errors: { create: "Please authorize GitHub access first" } }));
      toast.info("Redirecting to GitHub authorization...");
      window.location.href = `${BASE_URL}/github/authorize-app`;
      return;
    }

    let finalRepoName = state.repoName;
    let finalRepoUrl = state.repoUrl;
    let source = state.activeTab;

    if (state.activeTab === "local") {
      if (!state.localFiles || state.localFiles.length === 0) {
        setState(prev => ({ ...prev, errors: { create: "Please select a folder to upload" } }));
        return;
      }
      finalRepoName = state.localFolderName;
      finalRepoUrl = null;
      source = "local";
    } else if (state.activeTab === "github") {
      if (!state.repoUrl) {
        setState(prev => ({ ...prev, errors: { create: "Please enter a repository URL" } }));
        return;
      }
      try {
        setState(prev => ({ ...prev, isLoading: true }));
        const endpoint =
          state.repoType === "public"
            ? `${BASE_URL}/github/import-public-repository`
            : `${BASE_URL}/github/import-repository`;
        const repoData =
          state.repoType === "public"
            ? { project_id: projectId, repo_url: state.repoUrl }
            : { project_id: projectId, repo_full_name: state.repoUrl.replace("https://github.com/", ""), installation_id: state.installationId };
        const newRepo = await apiCall(endpoint, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify(repoData),
        });
        setState(prev => ({
          ...prev,
          repositories: [...prev.repositories, newRepo],
          open: false,
          repoName: "",
          repoUrl: "",
          githubRepos: [],
          localFolderName: "",
          localFiles: null,
          activeTab: "github",
          isLoading: false,
          errors: { ...prev.errors, create: null }, // Clear error on success
        }));
        toast.success("Repository imported successfully");
        navigate(`/repo/${newRepo.id}`);
      } catch (error) {
        setState(prev => ({
          ...prev,
          errors: { create: error.message || "Error importing repository" },
          isLoading: false,
        }));
        toast.error("Failed to import repository");
      }
      return;
    }

    if (!finalRepoName.trim()) {
      setState(prev => ({ ...prev, errors: { create: "Repository name cannot be empty" } }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const newRepo = await apiCall(`${BASE_URL}/repositories/create-repository`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: projectId,
          name: finalRepoName,
          source: source || "github",
          repo_url: finalRepoUrl || "",
          storage_path: `/repos/${projectId}/${finalRepoName.toLowerCase().replace(/\s+/g, "-")}`,
          created_at: new Date().getTime(),
          last_generated_at: null,
          last_generated_by: null,
        }),
      });
      setState(prev => ({
        ...prev,
        repositories: [...prev.repositories, newRepo],
        open: false,
        repoName: "",
        repoUrl: "",
        githubRepos: [],
        localFolderName: "",
        localFiles: null,
        activeTab: "github",
        isLoading: false,
        errors: { ...prev.errors, create: null },
      }));
      toast.success("Repository created successfully");
      navigate(`/repo/${newRepo.id}`);
    } catch (err) {
      setState(prev => ({ ...prev, errors: { create: err.message || "Error creating repository" }, isLoading: false }));
    }
  }, [state.activeTab, state.repoName, state.repoUrl, state.localFiles, state.localFolderName, state.repoType, state.installationId, state.hasGithubAccess, projectId, navigate]);

  const handleRenameRepo = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token || !state.newRepoName.trim()) {
      setState(prev => ({ ...prev, errors: { rename: "Repository name cannot be empty" } }));
      return;
    }
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const updatedRepo = await apiCall(`${BASE_URL}/repositories/update-repository/${state.selectedRepo.id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ name: state.newRepoName, source: "github" }),
      });
      setState(prev => ({
        ...prev,
        repositories: prev.repositories.map(r => (r.id === state.selectedRepo.id ? updatedRepo : r)),
        renameOpen: false,
        newRepoName: "",
        selectedRepo: null,
        isLoading: false,
        errors: { ...prev.errors, rename: null },
      }));
      toast.success("Repository renamed successfully");
    } catch (err) {
      setState(prev => ({ ...prev, errors: { rename: err.message || "Error renaming repository" }, isLoading: false }));
    }
  }, [state.newRepoName, state.selectedRepo]);

  const handleDeleteRepo = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      await apiCall(`${BASE_URL}/repositories/delete-repository/${state.selectedRepo.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      setState(prev => ({
        ...prev,
        repositories: prev.repositories.filter(r => r.id !== state.selectedRepo.id),
        deleteOpen: false,
        selectedRepo: null,
        isLoading: false,
        errors: { ...prev.errors, delete: null },
      }));
      toast.success("Repository deleted successfully");
    } catch (err) {
      setState(prev => ({ ...prev, errors: { delete: err.message || "Error deleting repository" }, isLoading: false }));
    }
  }, [state.selectedRepo]);

  const handleFolderSelect = useCallback((e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const firstFilePath = files[0].webkitRelativePath;
      const folderName = firstFilePath.split("/")[0];
      setState(prev => ({ ...prev, localFiles: files, localFolderName: folderName }));
    } else {
      setState(prev => ({ ...prev, localFiles: null, localFolderName: "" }));
    }
  }, []);

  // Initial fetch and GitHub access check
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && user && !state.hasFetched) {
      fetchProjectData(true);
      checkGithubAccess();
    }
  }, [user, state.hasFetched, fetchProjectData, checkGithubAccess]);

  // Poll for GitHub access after redirection
  useEffect(() => {
    if (!state.hasGithubAccess && state.hasFetched) {
      const interval = setInterval(async () => {
        await checkGithubAccess();
        if (state.hasGithubAccess) clearInterval(interval);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [state.hasGithubAccess, state.hasFetched, checkGithubAccess]);

  // Fixed debounced search term
  const [debouncedSearchTermFixed] = useDebounce(state.searchTerm, 300);
  const filteredRepos = state.repositories.filter(repo =>
    repo.name.toLowerCase().includes(debouncedSearchTermFixed.toLowerCase()) ||
    (repo.repo_url && repo.repo_url.toLowerCase().includes(debouncedSearchTermFixed.toLowerCase()))
  );

  return (
    <Suspense fallback={<ProjectsGridSkeleton />}>
      <div className="space-y-6 p-10 mt-8">
        <header className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <div className="flex justify-around -ml-20">
                <Button variant="ghost" size="sm" onClick={() => navigate(`/projects`)} className="text-muted-foreground hover:text-foreground">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-3xl font-bold mb-2 -ml-24">{state.project?.name || "Repositories"}</h1>
              </div>
              <p className="text-muted-foreground">Manage your project repositories</p>
            </div>
            <Button
              onClick={() => setState(prev => ({ ...prev, open: true }))}
              disabled={state.activeTab === "github" && !state.hasGithubAccess}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Repository
            </Button>
          </div>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search repositories..."
              value={state.searchTerm}
              onChange={e => setState(prev => ({ ...prev, searchTerm: e.target.value }))}
              className="pl-10 pr-10 w-full"
            />
            {state.searchTerm && (
              <X
                className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground cursor-pointer"
                onClick={() => setState(prev => ({ ...prev, searchTerm: "" }))}
              />
            )}
          </div>
        </header>

        {state.errors.fetch && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4 mr-2" />
            <AlertDescription>
              {state.errors.fetch}
              <Button variant="outline" size="sm" className="ml-4" onClick={() => fetchProjectData(true)}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {!state.hasFetched ? (
          <ProjectsGridSkeleton />
        ) : filteredRepos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRepos.map(repo => (
              <Card
                key={repo.id}
                className="overflow-hidden shadow-lg transition-all duration-300 ease-in-out hover:shadow-xl hover:scale-[1.02] cursor-pointer border border-border bg-background rounded-2xl"
                onClick={() => navigate(`/repo/${repo.id}`)}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="flex justify-between items-center text-lg font-semibold text-foreground">
                    <span className="truncate">
                      {repo.name}
                      <span className="ml-3"></span>
                      <span className="bg-[#00ff9d] text-white rounded-full px-4 py-1 text-xs font-medium">{repo.source}</span>
                    </span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={e => {
                            e.stopPropagation();
                            setState(prev => ({ ...prev, selectedRepo: repo, newRepoName: repo.name, renameOpen: true }));
                          }}
                        >
                          <Pencil className="h-4 w-4 mr-2" />
                          Rename
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={e => {
                            e.stopPropagation();
                            setState(prev => ({ ...prev, selectedRepo: repo, deleteOpen: true }));
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-3 space-y-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 mr-1 text-primary" />
                    <div>Created: {formatDate(repo.created_at)}</div>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 mr-1 text-primary" />
                    <div>Updated: {formatDate(repo.last_generated_at) || "Never"}</div>
                  </div>
                </CardContent>
                <CardFooter className="pt-2 border-t border-border bg-muted/40 rounded-b-2xl">
                  <div className="flex justify-between w-full text-sm">
                    <div className="flex items-center gap-1">
                      <GitBranch className="h-4 w-4 text-primary" />
                      <Badge variant="outline" className="px-2 py-1 text-xs font-medium">N/A files</Badge>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-primary" />
                      <Badge variant="outline" className="px-2 py-1 text-xs font-medium">{state.project?.collaborators || 0} collaborators</Badge>
                    </div>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : state.repositories.length > 0 ? (
          <div className="text-center py-8 text-muted-foreground">No repositories match your search criteria</div>
        ) : (
          <EmptyRepoState setOpen={() => setState(prev => ({ ...prev, open: true }))} />
        )}

        <Dialog open={state.open} onOpenChange={open => setState(prev => ({ ...prev, open }))}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Import Repository</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <Tabs value={state.activeTab} onValueChange={tab => setState(prev => ({ ...prev, activeTab: tab }))}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="github">GitHub</TabsTrigger>
                  <TabsTrigger value="local">Local</TabsTrigger>
                </TabsList>
                <TabsContent value="github">
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label className="text-right col-span-1">Repository URL</Label>
                      <div className="col-span-3">
                        <Input
                          value={state.repoUrl}
                          onChange={e => setState(prev => ({ ...prev, repoUrl: e.target.value }))}
                          placeholder="https://github.com/username/repo"
                          disabled={!state.hasGithubAccess}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label className="text-right col-span-1">Repository Type</Label>
                      <div className="col-span-3 flex gap-4">
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            id="public"
                            name="repoType"
                            value="public"
                            checked={state.repoType === "public"}
                            onChange={() => setState(prev => ({ ...prev, repoType: "public" }))}
                          />
                          <Label htmlFor="public">Public</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            id="private"
                            name="repoType"
                            value="private"
                            checked={state.repoType === "private"}
                            onChange={() => setState(prev => ({ ...prev, repoType: "private" }))}
                            disabled={!state.hasGithubAccess}
                          />
                          <Label htmlFor="private">Private (Own)</Label>
                        </div>
                      </div>
                    </div>
                    {state.errors.github && (
                      <Alert variant="destructive" className="mt-2">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        <AlertDescription>{state.errors.github}</AlertDescription>
                      </Alert>
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="local">
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label className="text-right col-span-1">Upload Folder</Label>
                      <div className="col-span-3">
                        <input
                          type="file"
                          webkitdirectory="true"
                          directory=""
                          onChange={handleFolderSelect}
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
                        />
                      </div>
                    </div>
                    {state.localFolderName && (
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right col-span-1">Folder Name</Label>
                        <div className="col-span-3">
                          <Input value={state.localFolderName} readOnly className="bg-transparent cursor-not-allowed" />
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
              {state.errors.create && (
                <Alert variant="destructive" className="mt-2">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  <AlertDescription>
                    {state.errors.create}
                    <Button variant="outline" size="sm" className="ml-4" onClick={handleCreateRepo} disabled={state.isLoading}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Retry
                    </Button>
                  </AlertDescription>
                </Alert>
              )}
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" disabled={state.isLoading}>Cancel</Button>
              </DialogClose>
              <Button
                onClick={handleCreateRepo}
                disabled={state.isLoading || (state.activeTab === "github" && !state.hasGithubAccess)}
              >
                {state.isLoading ? "Importing..." : "Import Repository"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      

        <Dialog open={state.renameOpen} onOpenChange={open => setState(prev => ({ ...prev, renameOpen: open }))}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Rename Repository</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">New Name</Label>
                <Input
                  value={state.newRepoName}
                  onChange={e => setState(prev => ({ ...prev, newRepoName: e.target.value }))}
                  className="col-span-3"
                />
              </div>
              {state.errors.rename && (
                <Alert variant="destructive" className="mt-2">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  <AlertDescription>
                    {state.errors.rename}
                    <Button variant="outline" size="sm" className="ml-4" onClick={handleRenameRepo} disabled={state.isLoading}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Retry
                    </Button>
                  </AlertDescription>
                </Alert>
              )}
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" disabled={state.isLoading}>Cancel</Button>
              </DialogClose>
              <Button onClick={handleRenameRepo} disabled={state.isLoading}>
                {state.isLoading ? "Renaming..." : "Rename"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={state.deleteOpen} onOpenChange={open => setState(prev => ({ ...prev, deleteOpen: open }))}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Delete Repository</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-muted-foreground">
                Are you sure you want to delete repository <span className="font-semibold">{state.selectedRepo?.name}</span>?
                This action cannot be undone.
              </p>
              {state.errors.delete && (
                <Alert variant="destructive" className="mt-4">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  <AlertDescription>
                    {state.errors.delete}
                    <Button variant="outline" size="sm" className="ml-4" onClick={handleDeleteRepo} disabled={state.isLoading}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Retry
                    </Button>
                  </AlertDescription>
                </Alert>
              )}
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" disabled={state.isLoading}>Cancel</Button>
              </DialogClose>
              <Button variant="destructive" onClick={handleDeleteRepo} disabled={state.isLoading}>
                {state.isLoading ? "Deleting..." : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Suspense>
  );
});

const ProjectsGridSkeleton = memo(() => (
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
));

const EmptyRepoState = memo(({ setOpen }) => (
  <Card className="overflow-hidden">
    <div className="h-1 bg-primary/20"></div>
    <CardContent className="flex flex-col items-center justify-center py-12">
      <div className="rounded-full bg-primary/10 p-3 mb-4">
        <FolderKanban className="h-6 w-6 text-primary" />
      </div>
      <h3 className="text-lg font-semibold mb-2">No Repositories Yet</h3>
      <p className="text-muted-foreground text-center mb-4">Create your first repository to get started.</p>
      <Button variant="outline" onClick={()=>setOpen()}>
        <Plus className="h-4 w-4 mr-2" />
        Create Repository
      </Button>
    </CardContent>
  </Card>
));

export default ProjectPage;