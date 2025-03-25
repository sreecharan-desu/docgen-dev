/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { memo, Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSetRecoilState, useRecoilValue } from "recoil";
import { useDebounce } from "use-debounce";
import * as Icons from "lucide-react";
import { projectAtom, projectsAtom } from "@/store/store";
import { useAuth } from "@/contexts/AuthContext";
import { apiMethods } from "@/utils/apis";
import { deepEqual, formatDate } from "@/utils/functions";

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
const Select = React.lazy(() => import("@/components/ui/select").then(mod => ({ default: mod.Select })));
const SelectTrigger = React.lazy(() => import("@/components/ui/select").then(mod => ({ default: mod.SelectTrigger })));
const SelectValue = React.lazy(() => import("@/components/ui/select").then(mod => ({ default: mod.SelectValue })));
const SelectContent = React.lazy(() => import("@/components/ui/select").then(mod => ({ default: mod.SelectContent })));
const SelectItem = React.lazy(() => import("@/components/ui/select").then(mod => ({ default: mod.SelectItem })));

// Types for project data
interface Project {
  id: string;
  name: string;
  description: string;
  created_at: number;
  updated_at?: number;
  size?: number;
  repo_count?: number;
  collaborator_count?: number;
  owner_id?: string;
}

// Unified cache for projects
const projectsCache = new Map<string, Project[]>();

// Projects API hook with caching
const useProjectsApi = () => {
  const projects = useRecoilValue(projectsAtom);
  const setProjects = useSetRecoilState(projectsAtom);
  const setProject = useSetRecoilState(projectAtom);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [state, setState] = useState({
    isLoading: false,
    errors: {} as Record<string, string>,
    hasFetched: false,
  });

  const validateToken = useCallback(() => {
    const token = localStorage.getItem("token");
    if (!token || !user) {
      navigate('/');
      return false;
    }
    return true;
  }, [user, navigate]);

  const fetchProjects = useCallback(async (force = false) => {
    if (!validateToken()) return;
    const cacheKey = "projects";

    if (!force && projectsCache.has(cacheKey)) {
      const cachedProjects = projectsCache.get(cacheKey)!;
      setProjects(cachedProjects);
      setState(prev => ({ ...prev, hasFetched: true, isLoading: false }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const newData = await apiMethods.listProjects();
      projectsCache.set(cacheKey, newData);
      if (!deepEqual(projects, newData)) {
        setProjects(newData);
      }
      setState(prev => ({ ...prev, isLoading: false, hasFetched: true }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        errors: { fetch: error instanceof Error ? error.message : "Failed to fetch projects" },
        isLoading: false,
        hasFetched: true,
      }));
    }
  }, [projects, setProjects, validateToken]);

  const createProject = useCallback(async (name: string, description: string) => {
    if (!validateToken() || !name.trim() || !description.trim()) return false;
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      if (projects.some(p => p.name.toLowerCase() === name.toLowerCase())) {
        setState(prev => ({
          ...prev,
          errors: { create: `Project "${name}" already exists` },
          isLoading: false,
        }));
        return false;
      }

      const projectData = { name, description, owner_id: user?.id };
      const newProject = await apiMethods.createProject(projectData);
      const updatedProjects = [...projects, newProject];
      projectsCache.set("projects", updatedProjects);
      setProjects(updatedProjects);
      setProject(newProject);
      navigate(`/project/${newProject.id}`);
      setState(prev => ({ ...prev, isLoading: false }));
      return true;
    } catch (error) {
      setState(prev => ({
        ...prev,
        errors: { create: error instanceof Error ? error.message : "Failed to create project" },
        isLoading: false,
      }));
      return false;
    }
  }, [validateToken, user, projects, setProjects, setProject, navigate]);

  const renameProject = useCallback(async (projectId: string, newName: string) => {
    if (!validateToken() || !newName.trim()) return false;
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const updatedProject = await apiMethods.updateProject(projectId, { name: newName });
      const updatedProjects = projects.map(p => p.id === projectId ? updatedProject : p);
      projectsCache.set("projects", updatedProjects);
      setProjects(updatedProjects);
      setState(prev => ({ ...prev, isLoading: false }));
      return true;
    } catch (error) {
      setState(prev => ({
        ...prev,
        errors: { rename: error instanceof Error ? error.message : "Failed to rename project" },
        isLoading: false,
      }));
      return false;
    }
  }, [validateToken, projects, setProjects]);

  const deleteProject = useCallback(async (projectId: string) => {
    if (!validateToken()) return false;
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      await apiMethods.deleteProject(projectId);
      const updatedProjects = projects.filter(p => p.id !== projectId);
      projectsCache.set("projects", updatedProjects);
      setProjects(updatedProjects);
      setState(prev => ({ ...prev, isLoading: false }));
      return true;
    } catch (error) {
      setState(prev => ({
        ...prev,
        errors: { delete: error instanceof Error ? error.message : "Failed to delete project" },
        isLoading: false,
      }));
      return false;
    }
  }, [validateToken, projects, setProjects]);

  const clearError = useCallback((key: string) => {
    setState(prev => {
      const newErrors = { ...prev.errors };
      delete newErrors[key];
      return { ...prev, errors: newErrors };
    });
  }, []);

  return { projects, ...state, fetchProjects, createProject, renameProject, deleteProject, clearError, setProject };
};

// Project Card Component (unchanged)
const ProjectCard = memo(({ project, onSelect, onRename, onDelete }: {
  project: Project;
  onSelect: (project: Project) => void;
  onRename: (project: Project) => void;
  onDelete: (project: Project) => void;
}) => {
  const sizeInMB = project.size ? (project.size / (1024 * 1024)).toFixed(1) : "0.0";
  return (
    <Card
      className="bg-[#191d23] border-none shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer rounded-lg"
      onClick={() => onSelect(project)}
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex justify-between items-center">
          <div className="text-lg font-medium text-gray-100 truncate max-w-[200px]">{project.name}</div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full hover:bg-[#2a2a2a]">
                <Icons.MoreVertical className="h-4 w-4 text-gray-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-[#191d23] border border-[#2a2a2a] text-gray-200">
              <DropdownMenuItem
                onClick={e => { e.stopPropagation(); onRename(project); }}
                className="flex items-center hover:bg-[#2a2a2a]"
              >
                <Icons.Pencil className="h-4 w-4 mr-2 text-gray-400" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-700" />
              <DropdownMenuItem
                className="flex items-center text-red-400 hover:bg-red-900/20"
                onClick={e => { e.stopPropagation(); onDelete(project); }}
              >
                <Icons.Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardTitle>
        <div className="text-sm text-gray-400 truncate mt-1">{project.description}</div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-col space-y-2 text-sm text-gray-400">
          <div className="flex items-center">
            <Icons.Calendar className="h-4 w-4 mr-1.5" />
            Created {formatDate(project.created_at)}
          </div>
          <div className="flex items-center">
            <Icons.Clock className="h-4 w-4 mr-1.5" />
            Updated {formatDate(project.updated_at)}
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-2 pb-4 gap-4">
        <div className="flex items-center gap-2">
          <Icons.GitBranch className="h-4 w-4 text-gray-400" />
          <Badge variant="outline" className="bg-transparent border-none text-gray-400 text-xs">
            {project.repo_count || 0} repos
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Icons.Users className="h-4 w-4 text-gray-400" />
          <Badge variant="outline" className="bg-transparent border-none text-gray-400 text-xs">
            {project.collaborator_count || 0} collaborators
          </Badge>
        </div>
        <Button
          onClick={e => { e.stopPropagation(); onSelect(project); }}
          className="ml-auto bg-[#00ff9d] text-black hover:bg-[#00ff9d]/90 rounded-full h-8 px-4 text-sm font-medium"
        >
          View
        </Button>
      </CardFooter>
    </Card>
  );
});

// Project Skeleton (unchanged)
const ProjectsGridSkeleton = memo(() => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array(3).fill(0).map((_, i) => (
      <div key={i} className="bg-[#191d23] shadow-md rounded-lg h-[200px] animate-pulse">
        <div className="p-6 pb-2">
          <div className="flex justify-between items-center">
            <div className="w-36 h-6 bg-[#2a2a2a] rounded"></div>
            <div className="w-8 h-8 rounded-full bg-[#2a2a2a]"></div>
          </div>
          <div className="w-full h-4 mt-2 bg-[#2a2a2a] rounded"></div>
        </div>
        <div className="px-6 py-2 space-y-2">
          {Array(3).fill(0).map((_, j) => (
            <div key={j} className="flex items-center">
              <div className="w-4 h-4 mr-2 bg-[#2a2a2a] rounded-full"></div>
              <div className="w-32 h-4 bg-[#2a2a2a] rounded"></div>
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
));

// Main ProjectsSection component
const ProjectsSection = memo(() => {
  const [state, setState] = useState({
    createDialogOpen: false,
    renameDialogOpen: false,
    deleteDialogOpen: false,
    selectedProject: null as Project | null,
    searchTerm: "",
    filters: {
      status: "all" as "all" | "active" | "inactive",
      minRepos: 0,
      minCollaborators: 0,
      dateRange: "all" as "all" | "week" | "month" | "year",
    },
    sort: "last_updated" as "last_updated" | "created" | "name" | "size",
    newName: "",
    newDescription: "",
  });

  const {
    projects,
    isLoading,
    errors,
    hasFetched,
    fetchProjects,
    createProject,
    renameProject,
    deleteProject,
    clearError,
    setProject,
  } = useProjectsApi();

  const { user } = useAuth();
  const navigate = useNavigate();
  const [debouncedSearchTerm] = useDebounce(state.searchTerm, 300);

  const filteredProjects = useMemo(() => {
    let filtered = projects || [];

    if (debouncedSearchTerm) {
      const lowercaseSearch = debouncedSearchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(lowercaseSearch) ||
        p.description.toLowerCase().includes(lowercaseSearch)
      );
    }

    if (state.filters.status !== "all") {
      filtered = filtered.filter(p =>
        state.filters.status === "active" ? !!p.updated_at : !p.updated_at
      );
    }

    filtered = filtered.filter(p => (p.repo_count || 0) >= state.filters.minRepos);
    filtered = filtered.filter(p => (p.collaborator_count || 0) >= state.filters.minCollaborators);

    if (state.filters.dateRange !== "all") {
      const now = Date.now();
      const ranges = {
        week: 7 * 24 * 60 * 60 * 1000,
        month: 30 * 24 * 60 * 60 * 1000,
        year: 365 * 24 * 60 * 60 * 1000,
      };
      const rangeMs = ranges[state.filters.dateRange];
      filtered = filtered.filter(p => p.created_at && (now - p.created_at) <= rangeMs);
    }

    return [...filtered].sort((a, b) => {
      switch (state.sort) {
        case "last_updated":
          return (b.updated_at || 0) - (a.updated_at || 0);
        case "created":
          return (b.created_at || 0) - (a.created_at || 0);
        case "name":
          return a.name.localeCompare(b.name);
        case "size":
          return (b.size || 0) - (a.size || 0);
        default:
          return 0;
      }
    });
  }, [projects, debouncedSearchTerm, state.filters, state.sort]);

  useEffect(() => {
    if (!hasFetched) fetchProjects();
  }, [fetchProjects, hasFetched]);

  const handleCreateProject = useCallback(async () => {
    const success = await createProject(state.newName, state.newDescription);
    if (success) {
      setState(prev => ({
        ...prev,
        createDialogOpen: false,
        newName: "",
        newDescription: "",
      }));
    }
  }, [createProject, state.newName, state.newDescription]);

  const handleRenameProject = useCallback(async () => {
    if (!state.selectedProject) return;
    const success = await renameProject(state.selectedProject.id, state.selectedProject.name);
    if (success) {
      setState(prev => ({ ...prev, renameDialogOpen: false, selectedProject: null }));
    }
  }, [renameProject, state.selectedProject]);

  const handleDeleteProject = useCallback(async () => {
    if (!state.selectedProject) return;
    const success = await deleteProject(state.selectedProject.id);
    if (success) {
      setState(prev => ({ ...prev, deleteDialogOpen: false, selectedProject: null }));
    }
  }, [deleteProject, state.selectedProject]);

  const debouncedActions = {
    create: useDebounce(handleCreateProject, 500)[0],
    rename: useDebounce(handleRenameProject, 500)[0],
    delete: useDebounce(handleDeleteProject, 500)[0],
  };

  const handleSelectProject = useCallback((project: Project) => {
    setProject(project);
    navigate(`/project/${project.id}`);
  }, [setProject, navigate]);

  const openRenameDialog = useCallback((project: Project) => {
    setState(prev => ({
      ...prev,
      selectedProject: { ...project },
      renameDialogOpen: true,
    }));
  }, []);

  const openDeleteDialog = useCallback((project: Project) => {
    setState(prev => ({
      ...prev,
      selectedProject: project,
      deleteDialogOpen: true,
    }));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-2">
      <Suspense fallback={<ProjectsGridSkeleton />}>
        <header className="mb-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
            <div className="relative">
              <div className="absolute mt-4 -top-1 -left-2 h-10 w-1 bg-gradient-to-b from-transparent via-gray-500/20 to-transparent"></div>
              <h1 className="text-4xl mt-4 font-bold capitalize bg-clip-text text-transparent text-white">
                {user?.name ? `${user.name}'s Projects` : 'My Projects'}
              </h1>
              <p className="text-gray-400 mt-1 text-sm flex items-center">
                <Icons.FolderKanban className="h-3.5 w-3.5 mr-1.5 text-gray-500" />
                Manage your DocGen projects
              </p>
            </div>
            <Button
              onClick={() => setState(prev => ({ ...prev, createDialogOpen: true }))}
              className="bg-[#00ff9d] hover:bg-[#00ff9d]/90 text-black px-4 py-2 rounded-full flex items-center gap-2 transition-colors text-sm font-medium"
            >
              <Icons.Plus className="h-5 w-5" />
              Create Project
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full sm:w-auto">
              <Icons.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search projects..."
                value={state.searchTerm}
                onChange={e => setState(prev => ({ ...prev, searchTerm: e.target.value }))}
                className="pl-10 pr-10 py-2 bg-transparent border border-gray-700 text-gray-200 rounded-md w-full text-sm focus:ring-2 focus:ring-[#00ff9d]/50"
              />
              {state.searchTerm && (
                <Icons.X
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 hover:text-white cursor-pointer"
                  onClick={() => setState(prev => ({ ...prev, searchTerm: "" }))}
                />
              )}
            </div>

            <div className="flex flex-wrap gap-3 w-full sm:w-auto">


              <Select
                value={state.filters.minRepos.toString()}
                onValueChange={value => setState(prev => ({
                  ...prev,
                  filters: { ...prev.filters, minRepos: parseInt(value) },
                }))}
              >
                <SelectTrigger className="w-[180px] border-gray-700 bg-transparent text-gray-200">
                  <SelectValue placeholder="Min Repos" />
                </SelectTrigger>
                <SelectContent className="bg-[#191d23] border-gray-700 text-gray-200">
                  <SelectItem value="0">0+ Repos</SelectItem>
                  <SelectItem value="1">1+ Repos</SelectItem>
                  <SelectItem value="5">5+ Repos</SelectItem>
                  <SelectItem value="10">10+ Repos</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={state.filters.minCollaborators.toString()}
                onValueChange={value => setState(prev => ({
                  ...prev,
                  filters: { ...prev.filters, minCollaborators: parseInt(value) },
                }))}
              >
                <SelectTrigger className="w-[180px] border-gray-700 bg-transparent text-gray-200">
                  <SelectValue placeholder="Min Collaborators" />
                </SelectTrigger>
                <SelectContent className="bg-[#191d23] border-gray-700 text-gray-200">
                  <SelectItem value="0">0+ Collaborators</SelectItem>
                  <SelectItem value="1">1+ Collaborators</SelectItem>
                  <SelectItem value="2">2+ Collaborators</SelectItem>
                  <SelectItem value="5">5+ Collaborators</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={state.filters.dateRange}
                onValueChange={value => setState(prev => ({
                  ...prev,
                  filters: { ...prev.filters, dateRange: value as "all" | "week" | "month" | "year" },
                }))}
              >
                <SelectTrigger className="w-[180px] border-gray-700 bg-transparent text-gray-200">
                  <SelectValue placeholder="Date Range" />
                </SelectTrigger>
                <SelectContent className="bg-[#191d23] border-gray-700 text-gray-200">
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="week">Last Week</SelectItem>
                  <SelectItem value="month">Last Month</SelectItem>
                  <SelectItem value="year">Last Year</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={state.sort}
                onValueChange={value => setState(prev => ({
                  ...prev,
                  sort: value as "last_updated" | "created" | "name" | "size",
                }))}
              >
                <SelectTrigger className="w-[180px] border-gray-700 bg-transparent text-gray-200">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent className="bg-[#191d23] border-gray-700 text-gray-200">
                  <SelectItem value="last_updated">Last Updated</SelectItem>
                  <SelectItem value="created">Created</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="size">Size</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </header>

        {errors.fetch && (
          <Alert className="bg-red-900/20 border border-red-700 text-red-300 mb-6 rounded-md">
            <div className="flex items-center">
              <Icons.AlertCircle className="h-5 w-5 mr-3 text-red-400" />
              <AlertDescription className="text-sm font-medium flex-1">
                {errors.fetch}
              </AlertDescription>
              <Button
                variant="outline"
                size="sm"
                onClick={() => { clearError('fetch'); fetchProjects(true); }}
                className="border-red-700 hover:bg-red-900/30 text-red-300"
              >
                Retry
              </Button>
            </div>
          </Alert>
        )}

        {!hasFetched ? (
          <ProjectsGridSkeleton />
        ) : filteredProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 bg-[#191d23] rounded-lg border border-gray-700">
            <Icons.FolderSearch className="h-12 w-12 mb-4 text-gray-500" />
            <h3 className="text-xl font-medium text-gray-300 mb-2 text-center">
              {debouncedSearchTerm ? "No matching projects found" : "No projects yet"}
            </h3>
            <p className="text-gray-400 text-center max-w-md mb-6">
              {debouncedSearchTerm
                ? "Adjust your filters or create a new project."
                : "Get started by creating your first project."}
            </p>
            <Button
              onClick={() => setState(prev => ({ ...prev, createDialogOpen: true }))}
              className="bg-[#00ff9d] hover:bg-[#00ff9d]/90 text-black rounded-full flex items-center gap-2 transition-colors text-sm font-medium px-4 py-2"
            >
              <Icons.Plus className="h-5 w-5" />
              Create New Project
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map(project => (
              <ProjectCard
                key={project.id}
                project={project}
                onSelect={handleSelectProject}
                onRename={openRenameDialog}
                onDelete={openDeleteDialog}
              />
            ))}
          </div>
        )}
      </Suspense>

      <Suspense fallback={null}>
        <Dialog
          open={state.createDialogOpen}
          onOpenChange={open => setState(prev => ({
            ...prev,
            createDialogOpen: open,
            newName: open ? prev.newName : "",
            newDescription: open ? prev.newDescription : "",
            errors: open ? prev.errors : { ...prev.errors, create: undefined },
          }))}
        >
          <DialogContent className="sm:max-w-md bg-[#191d23] border border-gray-700 text-gray-200">
            <DialogHeader>
              <DialogTitle className="text-white">Create New Project</DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="projectName" className="text-sm font-medium text-gray-300">Project Name</Label>
                <Input
                  id="projectName"
                  placeholder="Enter project name"
                  value={state.newName}
                  onChange={e => setState(prev => ({ ...prev, newName: e.target.value }))}
                  className="bg-[#2a2a2a] border-gray-700 text-gray-200 focus:ring-2 focus:ring-[#00ff9d]/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="projectDescription" className="text-sm font-medium text-gray-300">Description</Label>
                <Input
                  id="projectDescription"
                  placeholder="Enter project description"
                  value={state.newDescription}
                  onChange={e => setState(prev => ({ ...prev, newDescription: e.target.value }))}
                  className="bg-[#2a2a2a] border-gray-700 text-gray-200 focus:ring-2 focus:ring-[#00ff9d]/50"
                />
              </div>
              {errors.create && (
                <Alert className="bg-red-900/20 border border-red-700 text-red-300">
                  <Icons.AlertCircle className="h-4 w-4 mr-2 text-red-400" />
                  <AlertDescription>{errors.create}</AlertDescription>
                </Alert>
              )}
            </div>
            <DialogFooter className="gap-3">
              <DialogClose asChild>
                <Button variant="outline" disabled={isLoading} className="border-gray-700 hover:bg-[#2a2a2a] text-gray-300 rounded-full">
                  <Icons.X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </DialogClose>
              <Button
                onClick={debouncedActions.create}
                disabled={!state.newName.trim() || !state.newDescription.trim() || isLoading}
                className="bg-[#00ff9d] hover:bg-[#00ff9d]/90 text-black rounded-full"
              >
                {isLoading ? <Icons.Loader className="h-4 w-4 mr-2 animate-spin" /> : <Icons.Plus className="h-4 w-4 mr-2" />}
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog
          open={state.renameDialogOpen}
          onOpenChange={open => setState(prev => ({
            ...prev,
            renameDialogOpen: open,
            selectedProject: open ? prev.selectedProject : null,
            errors: open ? prev.errors : { ...prev.errors, rename: undefined },
          }))}
        >
          <DialogContent className="sm:max-w-md bg-[#191d23] border border-gray-700 text-gray-200">
            <DialogHeader>
              <DialogTitle className="text-white">Rename Project</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <Input
                placeholder="Enter new name"
                value={state.selectedProject?.name || ""}
                onChange={e => setState(prev => ({
                  ...prev,
                  selectedProject: prev.selectedProject ? { ...prev.selectedProject, name: e.target.value } : null,
                }))}
                className="mb-4 bg-[#2a2a2a] border-gray-700 text-gray-200 focus:ring-2 focus:ring-[#00ff9d]/50"
              />
              {errors.rename && (
                <Alert className="bg-red-900/20 border border-red-700 text-red-300">
                  <Icons.AlertCircle className="h-4 w-4 mr-2 text-red-400" />
                  <AlertDescription className="flex items-center justify-between w-full">
                    {errors.rename}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={debouncedActions.rename}
                      disabled={isLoading}
                      className="ml-2 border-red-700 hover:bg-red-900/30 text-red-300"
                    >
                      <Icons.RefreshCw className="h-4 w-4 mr-1" />
                      Retry
                    </Button>
                  </AlertDescription>
                </Alert>
              )}
            </div>
            <DialogFooter className="gap-3">
              <DialogClose asChild>
                <Button variant="outline" disabled={isLoading} className="border-gray-700 hover:bg-[#2a2a2a] text-gray-300 rounded-full">
                  <Icons.X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </DialogClose>
              <Button
                onClick={debouncedActions.rename}
                disabled={!state.selectedProject?.name.trim() || isLoading}
                className="bg-[#00ff9d] hover:bg-[#00ff9d]/90 text-black rounded-full"
              >
                {isLoading ? <Icons.Loader className="h-4 w-4 mr-2 animate-spin" /> : <Icons.Pencil className="h-4 w-4 mr-2" />}
                Rename
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog
          open={state.deleteDialogOpen}
          onOpenChange={open => setState(prev => ({
            ...prev,
            deleteDialogOpen: open,
            selectedProject: open ? prev.selectedProject : null,
            errors: open ? prev.errors : { ...prev.errors, delete: undefined },
          }))}
        >
          <DialogContent className="sm:max-w-md bg-[#191d23] border border-gray-700 text-gray-200">
            <DialogHeader>
              <DialogTitle className="text-red-400">Delete Project</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-gray-300">
                Are you sure you want to delete <span className="font-medium text-white">{state.selectedProject?.name}</span>?
              </p>
              <p className="text-gray-400 text-sm mt-2">
                This action cannot be undone and all associated data will be permanently removed.
              </p>
              {errors.delete && (
                <Alert className="mt-4 bg-red-900/20 border border-red-700 text-red-300">
                  <Icons.AlertCircle className="h-4 w-4 mr-2 text-red-400" />
                  <AlertDescription className="flex items-center justify-between w-full">
                    {errors.delete}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={debouncedActions.delete}
                      disabled={isLoading}
                      className="ml-2 border-red-700 hover:bg-red-900/30 text-red-300"
                    >
                      <Icons.RefreshCw className="h-4 w-4 mr-1" />
                      Retry
                    </Button>
                  </AlertDescription>
                </Alert>
              )}
            </div>
            <DialogFooter className="gap-3">
              <DialogClose asChild>
                <Button variant="outline" disabled={isLoading} className="border-gray-700 hover:bg-[#2a2a2a] text-gray-300 rounded-full">
                  <Icons.X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </DialogClose>
              <Button
                onClick={debouncedActions.delete}
                disabled={isLoading}
                className="bg-red-600 hover:bg-red-700 text-white rounded-full"
              >
                {isLoading ? <Icons.Loader className="h-4 w-4 mr-2 animate-spin" /> : <Icons.Trash2 className="h-4 w-4 mr-2" />}
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Suspense>
    </div>
  );
});

export default ProjectsSection;