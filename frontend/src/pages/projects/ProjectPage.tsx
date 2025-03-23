/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { memo, useEffect, useState, useCallback, Suspense } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useDebounce } from "use-debounce";
import { apiMethods, BASE_URL } from "@/utils/apis";
import { deepEqual, formatDate } from "@/utils/functions";
import { projectAtom, projectsAtom } from "@/store/store";
import * as Icons from "lucide-react";
import { useRecoilState, useRecoilValue } from "recoil";

// Lazy-loaded components
const Button = React.lazy(() => import("@/components/ui/button").then(mod => ({ default: mod.Button })));
const Input = React.lazy(() => import("@/components/ui/input").then(mod => ({ default: mod.Input })));
const Label = React.lazy(() => import("@/components/ui/label").then(mod => ({ default: mod.Label })));
const Card = React.lazy(() => import("@/components/ui/card").then(mod => ({ default: mod.Card })));
const CardContent = React.lazy(() => import("@/components/ui/card").then(mod => ({ default: mod.CardContent })));
const CardHeader = React.lazy(() => import("@/components/ui/card").then(mod => ({ default: mod.CardHeader })));
const CardTitle = React.lazy(() => import("@/components/ui/card").then(mod => ({ default: mod.CardTitle })));
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
const Progress = React.lazy(() => import("@/components/ui/progress").then(mod => ({ default: mod.Progress })));

// Cache for API responses
const cache = {
  project: new Map(),
  repositories: new Map(),
  githubRepos: null,
  githubAccess: null,
};

// Text file extensions for filtering
export const TEXT_FILE_EXTENSIONS = [
  '.txt', '.py', '.js', '.ts', '.jsx', '.tsx', '.html', '.css', '.json', '.md', '.java', '.cpp', '.c', '.rb',
  '.go', '.rs', '.kt', '.kts', '.scala', '.sc', '.swift', '.m', '.mm', '.cs', '.fs', '.vb', '.r', '.pl', '.pm',
  '.php', '.phtml', '.lua', '.dart', '.erl', '.ex', '.exs', '.hs', '.lhs', '.clj', '.cljs', '.groovy', '.gvy',
  '.jl', '.sh', '.bash', '.zsh', '.fish', '.ps1', '.bat', '.cmd', '.v', '.vhdl', '.sv', '.asm', '.s', '.nasm',
  '.f', '.f90', '.f95', '.pas', '.dpr', '.ada', '.adb', '.ads', '.cob', '.cbl', '.ml', '.mli', '.elm', '.purs',
  '.nim', '.cr', '.rkt', '.scm', '.ss', '.lisp', '.cl', '.matlab', '.oct', '.pro', '.d', '.zig', '.vala', '.vapi',
  '.h', '.hpp', '.hxx', '.hh', '.inl', '.xml', '.svg', '.xhtml', '.vue', '.svelte', '.astro', '.ejs', '.erb',
  '.haml', '.pug', '.jade', '.scss', '.sass', '.less', '.styl', '.yaml', '.yml', '.toml', '.ini', '.cfg', '.conf',
  '.env', '.properties', '.csv', '.tsv', '.rst', '.adoc', '.tex', '.bib', '.org', '.make', '.mk', '.gradle',
  '.cmake', '.ninja', '.dockerfile', '.lock', '.sql', '.graphql', '.gql', '.proto', '.thrift', '.avsc', '.log',
  '.diff', '.patch'
];

// Process local files for upload, filtering out hidden and non-text files
const processLocalFiles = async (files: FileList) => {
  const fileList: { path: string; content: string }[] = [];
  for (const file of files) {
    const fileName = file.name;
    const extension = fileName.slice(fileName.lastIndexOf('.')).toLowerCase();

    // Skip hidden files and non-text files
    if (fileName.startsWith('.') || !TEXT_FILE_EXTENSIONS.includes(extension)) {
      continue;
    }

    try {
      const content = await file.text();
      fileList.push({
        path: file.webkitRelativePath,
        content: content,
      });
    } catch (error) {
      console.error(`Error reading file ${file.name}:`, error);
    }
  }
  return fileList;
};

// Format date to match the UI
const formatDateDisplay = (timestamp) => {
  if (!timestamp) return "0";
  const date = new Date(Number(timestamp));
  return isNaN(date.getTime()) ? "0" : date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const ProjectPage = memo(() => {
  const { id: projectId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [projectState, setProject] = useRecoilState(projectAtom);
  const projects = useRecoilValue(projectsAtom);

  const [state, setState] = useState({
    open: false,
    renameOpen: false,
    deleteOpen: false,
    repoName: "",
    repoUrl: "",
    newRepoName: "",
    isLoading: false,
    uploadProgress: 0,
    errors: {} as Record<string, string | null>,
    project: null as { name: string; id: string; collaborators: number } | null,
    repositories: [] as any[],
    selectedRepo: null as any,
    searchTerm: "",
    activeTab: "github",
    githubRepos: [] as any[],
    localFolderName: "",
    localFiles: null as FileList | null,
    hasGithubAccess: false,
    installationId: null as string | null,
    showRepoList: false,
    hasFetched: false,
    filter: "all",
    sort: "last_updated",
  });

  const [debouncedSearchTerm] = useDebounce(state.searchTerm, 300);

  const validateToken = useCallback(() => {
    const token = localStorage.getItem("token");
    if (!token || !user) {
      navigate("/");
      return false;
    }
    return true;
  }, [user, navigate]);

  const checkGithubAccess = useCallback(async (force = false) => {
    if (!validateToken()) return;
    if (!force && cache.githubAccess !== null) {
      setState(prev => ({
        ...prev,
        hasGithubAccess: cache.githubAccess.has_access,
        installationId: cache.githubAccess.installation_id,
        showRepoList: cache.githubAccess.has_access,
      }));
      if (cache.githubAccess.has_access) fetchGithubRepos();
      return;
    }

    try {
      const response = await apiMethods.checkGithubAccess();
      cache.githubAccess = response;
      setState(prev => ({
        ...prev,
        hasGithubAccess: response.has_access,
        installationId: response.installation_id,
        showRepoList: response.has_access,
      }));
      if (!response.has_access) {
        toast.info("Please authorize GitHub access to import repositories");
      } else {
        fetchGithubRepos();
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        errors: { githubAccess: "Failed to check GitHub access: " + error.message },
      }));
    }
  }, [validateToken]);

  const fetchGithubRepos = useCallback(async (force = false) => {
    if (!validateToken()) return;
    if (!force && cache.githubRepos) {
      setState(prev => ({
        ...prev,
        githubRepos: cache.githubRepos,
        isLoading: false,
      }));
      return;
    }

    try {
      setState(prev => ({ ...prev, isLoading: true }));
      const response = await apiMethods.listGithubRepos();
      const formattedRepos = response.repositories.map(repo => ({
        name: repo.name,
        url: repo.html_url,
        full_name: repo.full_name,
        visibility: repo.visibility,
      }));
      cache.githubRepos = formattedRepos;
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
  }, [validateToken]);

  const fetchProjectData = useCallback(async (force = false) => {
    if (!validateToken()) return;

    try {
      let projectData, reposData;

      const projectFromAtom = projects?.find(p => p.id === projectId);
      const projectInCache = !force && cache.project.has(projectId);
      const reposInCache = !force && cache.repositories.has(projectId);

      if (projectInCache && reposInCache) {
        projectData = cache.project.get(projectId);
        reposData = cache.repositories.get(projectId);
      } else {
        if (projectFromAtom && !force) {
          projectData = projectFromAtom;
        } else {
          projectData = await apiMethods.getProject(projectId);
          cache.project.set(projectId, projectData);
        }

        if (reposInCache) {
          reposData = cache.repositories.get(projectId);
        } else {
          reposData = await apiMethods.listRepositories(projectId);
          cache.repositories.set(projectId, reposData);
        }
      }

      const newProject = {
        name: projectData.name,
        id: projectData.id,
        collaborators: projectData.collaborator_count
      };

      setProject(newProject);

      setState(prev => {
        if (force || !deepEqual(prev.project, newProject) || !deepEqual(prev.repositories, reposData)) {
          return { ...prev, project: newProject, repositories: reposData, hasFetched: true };
        }
        return { ...prev, hasFetched: true };
      });
    } catch (err) {
      setState(prev => ({
        ...prev,
        errors: { fetch: err.message || "Error fetching data" },
        hasFetched: true
      }));
    }
  }, [projectId, validateToken, projects, setProject]);

  const handleAuthorizeGithub = useCallback(() => {
    localStorage.setItem("github_redirect_url", location.pathname + location.search);
    window.location.href = `${BASE_URL}/github/authorize-app`;
  }, [location]);

  const handleImportRepo = useCallback(async (repo: any) => {
    if (!validateToken()) return;
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      const repoData = repo.visibility === "public"
        ? { project_id: projectId, repo_url: repo.url }
        : { project_id: projectId, repo_full_name: repo.full_name, installation_id: state.installationId };

      const newRepo = await (repo.visibility === "public"
        ? apiMethods.importPublicRepo(repoData)
        : apiMethods.importPrivateRepo(repoData));

      cache.repositories.set(projectId, [...(cache.repositories.get(projectId) || []), newRepo]);
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
  }, [projectId, state.installationId, navigate, validateToken]);

  const handleCreateRepo = useCallback(async () => {
    if (!validateToken()) return;
    if (state.activeTab !== "local" || !state.localFiles || state.localFiles.length === 0) {
      setState(prev => ({ ...prev, errors: { create: "Please select a folder to upload" } }));
      return;
    }

    const finalRepoName = state.localFolderName;
    setState(prev => ({ ...prev, isLoading: true, uploadProgress: 0 }));

    try {
      const newRepo = await apiMethods.createRepository({
        project_id: projectId,
        name: finalRepoName,
        source: "local",
        repo_url: "",
        storage_path: `/repos/${projectId}/${finalRepoName.toLowerCase().replace(/\s+/g, "-")}`,
        created_at: new Date().getTime(),
        last_generated_at: null,
        last_generated_by: null,
      });

      const processedFiles = await processLocalFiles(state.localFiles);
      const totalFiles = processedFiles.length;
      if (totalFiles === 0) {
        throw new Error("No valid text files found to upload");
      }

      let uploadedFiles = 0;
      const uploadSimulation = setInterval(() => {
        uploadedFiles += 1;
        const progress = Math.min((uploadedFiles / totalFiles) * 100, 95);
        setState(prev => ({ ...prev, uploadProgress: progress }));
      }, 500);

      const uploadResponse = await apiMethods.uploadLocalFiles(projectId, finalRepoName, processedFiles);
      clearInterval(uploadSimulation);
      setState(prev => ({ ...prev, uploadProgress: 100 }));

      cache.repositories.set(projectId, [...(cache.repositories.get(projectId) || []), newRepo]);
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
        uploadProgress: 0,
        errors: { ...prev.errors, create: null },
      }));
      toast.success(`Repository created successfully with ${totalFiles} files`);
      navigate(`/repo/${newRepo.id}`);
    } catch (err) {
      clearInterval(uploadSimulation);
      setState(prev => ({
        ...prev,
        errors: { create: err.message || "Error creating repository or uploading files" },
        isLoading: false,
        uploadProgress: 0,
      }));
      toast.error("Failed to create repository or upload files");
    }
  }, [state.activeTab, state.localFiles, state.localFolderName, projectId, navigate, validateToken]);

  const handleRenameRepo = useCallback(async () => {
    if (!validateToken() || !state.newRepoName.trim()) {
      setState(prev => ({ ...prev, errors: { rename: "Repository name cannot be empty" } }));
      return;
    }
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const updatedRepo = await apiMethods.updateRepository(state.selectedRepo.id, {
        name: state.newRepoName,
        source: "github"
      });
      cache.repositories.set(projectId, cache.repositories.get(projectId).map(r => r.id === state.selectedRepo.id ? updatedRepo : r));
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
      setState(prev => ({
        ...prev,
        errors: { rename: err.message || "Error renaming repository" },
        isLoading: false
      }));
    }
  }, [state.newRepoName, state.selectedRepo, projectId, validateToken]);

  const handleDeleteRepo = useCallback(async () => {
    if (!validateToken()) return;
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      await apiMethods.deleteRepository(state.selectedRepo.id);
      cache.repositories.set(projectId, cache.repositories.get(projectId).filter(r => r.id !== state.selectedRepo.id));
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
      setState(prev => ({
        ...prev,
        errors: { delete: err.message || "Error deleting repository" },
        isLoading: false
      }));
    }
  }, [state.selectedRepo, projectId, validateToken]);

  const [debouncedHandleDeleteRepo] = useDebounce(handleDeleteRepo, 1000);
  const [debouncedHandleRenameRepo] = useDebounce(handleRenameRepo, 1000);
  const [debouncedHandleCreateRepo] = useDebounce(handleCreateRepo, 1000);
  const [debouncedHandleImportRepo] = useDebounce(handleImportRepo, 1000);

  const handleFolderSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const firstFilePath = files[0].webkitRelativePath;
      const folderName = firstFilePath.split("/")[0];
      setState(prev => ({ ...prev, localFiles: files, localFolderName: folderName }));
    } else {
      setState(prev => ({ ...prev, localFiles: null, localFolderName: "" }));
    }
  }, []);

  useEffect(() => {
    if (validateToken() && !state.hasFetched) {
      fetchProjectData(true);
      checkGithubAccess(true);
    }
  }, [state.hasFetched, fetchProjectData, checkGithubAccess, validateToken]);

  const filteredRepos = React.useMemo(() => {
    let filtered = state.repositories || [];

    if (debouncedSearchTerm) {
      const lowercaseSearch = debouncedSearchTerm.toLowerCase();
      filtered = filtered.filter(repo =>
        repo.name.toLowerCase().includes(lowercaseSearch) ||
        (repo.repo_url && repo.repo_url.toLowerCase().includes(lowercaseSearch))
      );
    }

    if (state.filter !== "all") {
      filtered = filtered.filter(repo => repo.source === state.filter);
    }

    switch (state.sort) {
      case "last_updated":
        return [...filtered].sort((a, b) => (b.last_generated_at || 0) - (a.last_generated_at || 0));
      case "created":
        return [...filtered].sort((a, b) => (a.created_at || 0) - (b.created_at || 0));
      default:
        return filtered;
    }
  }, [state.repositories, debouncedSearchTerm, state.filter, state.sort]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-2">
      {/* Suspense for main content */}
      <Suspense fallback={<ProjectsGridSkeleton />}>
        <header className="mb-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(`/projects`)}
                className="group relative flex items-center justify-center h-9 w-9 rounded-full bg-gray-800/40 hover:bg-gray-700/60 text-gray-400 hover:text-white transition-all duration-200 shadow-md hover:shadow-lg"
                aria-label="Back to projects"
              >
                <Icons.ChevronLeft className="h-5 w-5" />
                <span className="absolute inset-0 rounded-full bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></span>
              </Button>

              <div className="relative">
                <div className="absolute mt-4 -top-1 -left-2 h-10 w-1 bg-gradient-to-b from-transparent via-gray-500/20 to-transparent"></div>
                <h1 className="text-2xl mt-4 font-bold capitalize bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-500 to-white">
                  {state.project?.name || "Repositories"}
                </h1>
                <p className="text-gray-400 mt-1 text-sm flex items-center">
                  <Icons.Database className="h-3.5 w-3.5 mr-1.5 text-gray-500" />
                  Manage your project repositories
                </p>
              </div>
            </div>
            <Button
              onClick={() => setState(prev => ({ ...prev, open: true }))}
              className="bg-[#00ff9d] hover:bg-[#00ff9d]/90 text-black px-4 py-2 rounded-full flex items-center gap-2 transition-colors text-sm font-medium"
            >
              <Icons.Plus className="h-5 w-5" />
              Create Repository
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Icons.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search repositories..."
                value={state.searchTerm}
                onChange={e => setState(prev => ({ ...prev, searchTerm: e.target.value }))}
                className="pl-10 pr-10 py-2 bg-transparent border border-gray-700 text-gray-200 rounded-md w-full text-sm"
              />
              {state.searchTerm && (
                <Icons.X
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 hover:text-white cursor-pointer"
                  onClick={() => setState(prev => ({ ...prev, searchTerm: "" }))}
                />
              )}
            </div>

            <div className="flex gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="border-gray-700 bg-transparent text-gray-200 hover:bg-gray-700 flex items-center gap-2 text-sm">
                    {state.filter === "all" ? "All Repositories" : state.filter === "github" ? "GitHub" : "Local"}
                    <Icons.Filter className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-[#191d23] border border-gray-700 text-gray-200">
                  <DropdownMenuItem onClick={() => setState(prev => ({ ...prev, filter: "all" }))}>All Repositories</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setState(prev => ({ ...prev, filter: "github" }))}>GitHub</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setState(prev => ({ ...prev, filter: "local" }))}>Local</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="border-gray-700 bg-transparent text-gray-200 hover:bg-gray-700 flex items-center gap-2 text-sm">
                    {state.sort === "last_updated" ? "Last Updated" : "Created"}
                    <Icons.Filter className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-[#191d23] border border-gray-700 text-gray-200">
                  <DropdownMenuItem onClick={() => setState(prev => ({ ...prev, sort: "last_updated" }))}>Last Updated</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setState(prev => ({ ...prev, sort: "created" }))}>Created</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {state.errors.fetch && (
          <Alert className="bg-red-900/20 border border-red-700 text-red-300 mb-6 rounded-md">
            <div className="flex items-center">
              <Icons.AlertCircle className="h-5 w-5 mr-3 text-red-400" />
              <AlertDescription className="text-sm font-medium flex-1">
                {state.errors.fetch}
              </AlertDescription>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchProjectData(true)}
                className="border-red-700 hover:bg-red-900/30 text-red-300"
              >
                Retry
              </Button>
            </div>
          </Alert>
        )}

        {!state.hasFetched ? (
          <ProjectsGridSkeleton />
        ) : filteredRepos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRepos.map(repo => (
              <Card
                key={repo.id}
                className="bg-[#191d23] border-none shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer rounded-lg"
                onClick={() => navigate(`/repo/${repo.id}`)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="flex justify-between items-center">
                    <div className="text-lg font-medium text-gray-100 truncate max-w-[200px]">{repo.name}</div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full hover:bg-[#2a2a2a]">
                          <Icons.MoreVertical className="h-4 w-4 text-gray-400" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-[#191d23] border border-[#2a2a2a] text-gray-200">
                        <DropdownMenuItem
                          onClick={e => {
                            e.stopPropagation();
                            setState(prev => ({ ...prev, selectedRepo: repo, newRepoName: repo.name, renameOpen: true }));
                          }}
                          className="flex items-center hover:bg-[#2a2a2a]"
                        >
                          <Icons.Pencil className="h-4 w-4 mr-2 text-gray-400" />
                          Rename
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-gray-700" />
                        <DropdownMenuItem
                          className="flex items-center text-red-400 hover:bg-red-900/20"
                          onClick={e => {
                            e.stopPropagation();
                            setState(prev => ({ ...prev, selectedRepo: repo, deleteOpen: true }));
                          }}
                        >
                          <Icons.Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardTitle>
                  <div className="text-sm text-gray-400 truncate mt-1">{repo.source}</div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex flex-col space-y-2 text-sm text-gray-400">
                    <div className="flex items-center">
                      <Icons.Calendar className="h-4 w-4 mr-1.5 text-gray-400" />
                      Created {formatDateDisplay(repo.created_at)}
                    </div>
                    <div className="flex items-center">
                      <Icons.Clock className="h-4 w-4 mr-1.5 text-gray-400" />
                      Updated {formatDateDisplay(repo.last_generated_at) || "updated never"}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-2 pb-4 gap-4">
                  <div className="flex items-center gap-2">
                    <Icons.GitBranch className="h-4 w-4 text-gray-400" />
                    <Badge variant="outline" className="bg-transparent border-none text-gray-400 text-xs">
                      0 files
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icons.Users className="h-4 w-4 text-gray-400" />
                    <Badge variant="outline" className="bg-transparent border-none text-gray-400 text-xs">
                      {state.project?.collaborators || 0} collaborators
                    </Badge>
                  </div>
                  <Button
                    onClick={e => {
                      e.stopPropagation();
                      navigate(`/repo/${repo.id}`);
                    }}
                    className="ml-auto bg-[#00ff9d] text-black hover:bg-[#00ff9d]/90 rounded-full h-8 px-4 text-sm font-medium"
                  >
                    View
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : state.repositories.length > 0 ? (
          <div className="flex flex-col items-center justify-center p-12 bg-[#191d23] rounded-lg border border-gray-700">
            <Icons.FolderSearch className="h-12 w-12 mb-4 text-gray-500" />
            <h3 className="text-xl font-medium text-gray-300 mb-2 text-center">
              No matching repositories found
            </h3>
            <p className="text-gray-400 text-center max-w-md mb-6">
              Try adjusting your search term or create a new repository.
            </p>
            <Button
              onClick={() => setState(prev => ({ ...prev, open: true }))}
              className="bg-[#00ff9d] hover:bg-[#00ff9d]/90 text-black rounded-full flex items-center gap-2 transition-colors text-sm font-medium px-4 py-2"
            >
              <Icons.Plus className="h-5 w-5" />
              Create New Repository
            </Button>
          </div>
        ) : (
          <EmptyRepoState setOpen={() => setState(prev => ({ ...prev, open: true }))} />
        )}
      </Suspense>

      {/* Suspense for dialogs with minimal fallback */}
      <Suspense fallback={null}>
        <Dialog
          open={state.open}
          onOpenChange={open => setState(prev => ({ ...prev, open, repoUrl: "", localFiles: null, localFolderName: "", uploadProgress: 0 }))}
        >
          <DialogContent className="sm:max-w-md bg-[#191d23] border border-gray-700 text-gray-200">
            <DialogHeader>
              <DialogTitle className="text-white">Import Repository</DialogTitle>
            </DialogHeader>

            <div className="py-4">
              <p className="text-gray-400 mb-4 flex items-center">
                <Icons.GitBranch className="h-4 w-4 mr-2 text-gray-400" />
                Connect your project to a repository
              </p>

              <Tabs
                value={state.activeTab}
                onValueChange={tab => setState(prev => ({ ...prev, activeTab: tab }))}
              >
                <TabsList className="grid w-full grid-cols-2 bg-[#2a2a2a] rounded-md p-1 mb-4">
                  <TabsTrigger
                    value="github"
                    className={`text-gray-200 font-medium transition-all duration-200 ${state.activeTab === "github" ? "bg-[#00ff9d] text-black" : "bg-transparent hover:bg-[#333333]"} rounded-md`}
                  >
                    <Icons.Github className="h-4 w-4 mr-2" />
                    GitHub
                  </TabsTrigger>
                  <TabsTrigger
                    value="local"
                    className={`text-gray-200 font-medium transition-all duration-200 ${state.activeTab === "local" ? "bg-[#00ff9d] text-black" : "bg-transparent hover:bg-[#333333]"} rounded-md`}
                  >
                    <Icons.Folder className="h-4 w-4 mr-2" />
                    Local
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="github" className="mt-4 space-y-4">
                  {!state.hasGithubAccess ? (
                    <div className="text-center bg-[#2a2a2a]/50 p-6 rounded-lg border border-dashed border-gray-700">
                      <Icons.Github className="h-12 w-12 mx-auto mb-3 text-gray-500" />
                      <p className="text-gray-400 mb-4">Authorize GitHub to see and import your repositories</p>
                      <Button
                        onClick={handleAuthorizeGithub}
                        className="bg-[#00ff9d] text-black hover:bg-[#00ff9d]/90 font-medium rounded-full px-4 py-2"
                      >
                        <Icons.Lock className="h-4 w-4 mr-2" />
                        Authorize GitHub Now
                      </Button>
                    </div>
                  ) : state.showRepoList && state.githubRepos.length > 0 ? (
                    <div className="max-h-64 overflow-y-auto pr-1 space-y-2">
                      {state.githubRepos.map(repo => (
                        <div
                          key={repo.url}
                          className="flex justify-between items-center p-3 rounded-md bg-[#2a2a2a] hover:bg-[#333333] transition-colors duration-200"
                        >
                          <div>
                            <p className="text-gray-200 font-medium flex items-center">
                              <Icons.GitBranch className="h-4 w-4 mr-2 text-gray-400" />
                              {repo.name}
                            </p>
                            <p className="text-gray-400 text-sm flex items-center mt-1">
                              <Icons.Eye className="h-3 w-3 mr-1" />
                              {repo.visibility}
                            </p>
                          </div>
                          <Button
                            onClick={() => debouncedHandleImportRepo(repo)}
                            className="bg-[#00ff9d] text-black hover:bg-[#00ff9d]/90 rounded-full px-4 py-1 text-sm font-medium"
                            disabled={state.isLoading}
                          >
                            <Icons.Download className="h-4 w-4 mr-1" />
                            Import
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center bg-[#2a2a2a]/50 p-6 rounded-lg border border-dashed border-gray-700">
                      <Icons.FolderSearch className="h-12 w-12 mx-auto mb-3 text-gray-500" />
                      <p className="text-gray-400">No repositories found</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="local" className="mt-4">
                  <div className="space-y-4">
                    <div className="bg-[#2a2a2a]/50 p-4 rounded-lg border border-dashed border-gray-700">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right col-span-1 text-gray-300 font-medium">Upload Folder</Label>
                        <div className="col-span-3">
                          <div className="relative">
                            <input
                              type="file"
                              webkitdirectory="true"
                              directory=""
                              onChange={handleFolderSelect}
                              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-[#00ff9d] file:text-black hover:file:bg-[#00ff9d]/90 focus:outline-none"
                            />
                            <Icons.FolderUp className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500 pointer-events-none" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {state.localFolderName && (
                      <div className="bg-[#2a2a2a]/50 p-4 rounded-lg border border-gray-700">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label className="text-right col-span-1 text-gray-300 font-medium">Selected Folder</Label>
                          <div className="col-span-3">
                            <div className="relative">
                              <Input
                                value={state.localFolderName}
                                readOnly
                                className="bg-[#2a2a2a] text-gray-200 border-gray-700 cursor-not-allowed pl-9"
                              />
                              <Icons.Folder className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            </div>
                          </div>
                        </div>
                        {state.isLoading && (
                          <div className="mt-4">
                            <Progress value={state.uploadProgress} className="w-full bg-gray-700" />
                            <p className="text-sm text-gray-400 mt-2 text-center">
                              Uploading: {Math.round(state.uploadProgress)}%
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>

              {state.errors.create && (
                <Alert className="mt-4 bg-red-900/20 border border-red-700 text-red-300">
                  <Icons.AlertCircle className="h-4 w-4 mr-2 text-red-400" />
                  <AlertDescription className="flex items-center justify-between w-full">
                    <span>{state.errors.create}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="ml-4 border-red-700 hover:bg-red-900/30 text-red-300"
                      onClick={debouncedHandleCreateRepo}
                      disabled={state.isLoading}
                    >
                      <Icons.RefreshCw className="h-4 w-4 mr-2" />
                      Retry
                    </Button>
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {state.activeTab === "local" && (
              <DialogFooter className="gap-3">
                <DialogClose asChild>
                  <Button
                    variant="outline"
                    disabled={state.isLoading}
                    className="border-gray-700 hover:bg-[#2a2a2a] text-gray-300 rounded-full"
                  >
                    <Icons.X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </DialogClose>
                <Button
                  onClick={debouncedHandleCreateRepo}
                  disabled={state.isLoading || !state.localFiles}
                  className="bg-[#00ff9d] text-black hover:bg-[#00ff9d]/90 rounded-full font-medium"
                >
                  {state.isLoading ? (
                    <>
                      <Icons.Loader className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Icons.Download className="h-4 w-4 mr-2" />
                      Import Repository
                    </>
                  )}
                </Button>
              </DialogFooter>
            )}
          </DialogContent>
        </Dialog>

        <Dialog
          open={state.renameOpen}
          onOpenChange={open => setState(prev => ({ ...prev, renameOpen: open }))}
        >
          <DialogContent className="sm:max-w-md bg-[#191d23] border border-gray-700 text-gray-200">
            <DialogHeader>
              <DialogTitle className="text-white">Rename Repository</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <Input
                value={state.newRepoName}
                onChange={e => setState(prev => ({ ...prev, newRepoName: e.target.value }))}
                placeholder="Enter new repository name"
                className="mb-4 bg-[#2a2a2a] border-gray-700 text-gray-200"
              />
              {state.errors.rename && (
                <Alert className="mt-4 bg-red-900/20 border border-red-700 text-red-300">
                  <Icons.AlertCircle className="h-4 w-4 mr-2 text-red-400" />
                  <AlertDescription className="flex items-center justify-between w-full">
                    <span>{state.errors.rename}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="ml-4 border-red-700 hover:bg-red-900/30 text-red-300"
                      onClick={debouncedHandleRenameRepo}
                      disabled={state.isLoading}
                    >
                      <Icons.RefreshCw className="h-4 w-4 mr-2" />
                      Retry
                    </Button>
                  </AlertDescription>
                </Alert>
              )}
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" disabled={state.isLoading} className="border-gray-700 hover:bg-[#2a2a2a] text-gray-300 rounded-full">
                  Cancel
                </Button>
              </DialogClose>
              <Button
                onClick={debouncedHandleRenameRepo}
                disabled={state.isLoading || !state.newRepoName.trim()}
                className="bg-[#00ff9d] hover:bg-[#00ff9d]/90 text-black rounded-full"
              >
                {state.isLoading ? "Renaming..." : "Rename"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog
          open={state.deleteOpen}
          onOpenChange={open => setState(prev => ({ ...prev, deleteOpen: open }))}
        >
          <DialogContent className="sm:max-w-md bg-[#191d23] border border-gray-700 text-gray-200">
            <DialogHeader>
              <DialogTitle className="text-red-400">Delete Repository</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-gray-300">
                Are you sure you want to delete repository <span className="font-medium text-white">{state.selectedRepo?.name}</span>?
              </p>
              <p className="text-gray-400 text-sm mt-2">
                This action cannot be undone and all associated data will be permanently removed.
              </p>
              {state.errors.delete && (
                <Alert className="mt-4 bg-red-900/20 border border-red-700 text-red-300">
                  <Icons.AlertCircle className="h-4 w-4 mr-2 text-red-400" />
                  <AlertDescription className="flex items-center justify-between w-full">
                    <span>{state.errors.delete}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="ml-4 border-red-700 hover:bg-red-900/30 text-red-300"
                      onClick={debouncedHandleDeleteRepo}
                      disabled={state.isLoading}
                    >
                      <Icons.RefreshCw className="h-4 w-4 mr-2" />
                      Retry
                    </Button>
                  </AlertDescription>
                </Alert>
              )}
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" disabled={state.isLoading} className="border-gray-700 hover:bg-[#2a2a2a] text-gray-300 rounded-full">
                  Cancel
                </Button>
              </DialogClose>
              <Button
                variant="destructive"
                onClick={debouncedHandleDeleteRepo}
                disabled={state.isLoading}
                className="bg-red-600 hover:bg-red-700 text-white rounded-full"
              >
                {state.isLoading ? "Deleting..." : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Suspense>
    </div>
  );
});

const ProjectsGridSkeleton = memo(() => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {[1, 2, 3].map(i => (
      <div key={i} className="bg-[#191d23] shadow-md rounded-lg overflow-hidden h-[200px] animate-pulse">
        <div className="p-6 pb-2">
          <div className="flex justify-between items-center">
            <div className="w-36 h-6 bg-[#2a2a2a] rounded"></div>
            <div className="w-8 h-8 rounded-full bg-[#2a2a2a]"></div>
          </div>
          <div className="w-full h-4 mt-2 bg-[#2a2a2a] rounded"></div>
        </div>
        <div className="px-6 py-2">
          <div className="space-y-2">
            <div className="flex items-center">
              <div className="w-4 h-4 mr-2 bg-[#2a2a2a] rounded-full"></div>
              <div className="w-32 h-4 bg-[#2a2a2a] rounded"></div>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 mr-2 bg-[#2a2a2a] rounded-full"></div>
              <div className="w-24 h-4 bg-[#2a2a2a] rounded"></div>
            </div>
          </div>
        </div>
        <div className="px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#2a2a2a] rounded-full"></div>
            <div className="w-16 h-4 bg-[#2a2a2a] rounded"></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#2a2a2a] rounded-full"></div>
            <div className="w-20 h-4 bg-[#2a2a2a] rounded"></div>
          </div>
          <div className="w-16 h-8 bg-[#2a2a2a] rounded-full"></div>
        </div>
      </div>
    ))}
  </div>
));

const EmptyRepoState = memo(({ setOpen }: { setOpen: () => void }) => (
  <div className="flex flex-col items-center justify-center p-12 bg-[#191d23] rounded-lg border border-gray-700">
    <Icons.FolderSearch className="h-12 w-12 mb-4 text-gray-500" />
    <h3 className="text-xl font-medium text-gray-300 mb-2 text-center">No repositories yet</h3>
    <p className="text-gray-400 text-center max-w-md mb-6">Get started by creating your first repository.</p>
    <Button
      onClick={setOpen}
      className="bg-[#00ff9d] hover:bg-[#00ff9d]/90 text-black rounded-full flex items-center gap-2 transition-colors text-sm font-medium px-4 py-2"
    >
      <Icons.Plus className="h-5 w-5" />
      Create New Repository
    </Button>
  </div>
));

export default ProjectPage;