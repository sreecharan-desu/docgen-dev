/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { memo, Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSetRecoilState, useRecoilValue } from "recoil";
import { useDebounce } from "use-debounce";
import {
  Plus, FolderKanban, AlertCircle, Clock, Users, GitBranch,
  Search, X, MoreVertical, Pencil, Trash2, RefreshCw,
  FolderSearch, Loader, Filter, Calendar
} from "lucide-react";

// App imports
import { projectAtom, projectsAtom } from "@/store/store";
import { useAuth } from "@/contexts/AuthContext";
import { apiMethods, cache } from "@/utils/apis";
import { deepEqual } from "@/utils/functions";

// UI Components - imported with better organization
const UI = {
  // Core components
  Button: React.lazy(() => import("@/components/ui/button").then(mod => ({ default: mod.Button }))),
  Input: React.lazy(() => import("@/components/ui/input").then(mod => ({ default: mod.Input }))),
  Label: React.lazy(() => import("@/components/ui/label").then(mod => ({ default: mod.Label }))),

  // Card components
  Card: React.lazy(() => import("@/components/ui/card").then(mod => ({ default: mod.Card }))),
  CardContent: React.lazy(() => import("@/components/ui/card").then(mod => ({ default: mod.CardContent }))),
  CardHeader: React.lazy(() => import("@/components/ui/card").then(mod => ({ default: mod.CardHeader }))),
  CardTitle: React.lazy(() => import("@/components/ui/card").then(mod => ({ default: mod.CardTitle }))),
  CardDescription: React.lazy(() => import("@/components/ui/card").then(mod => ({ default: mod.CardDescription }))),
  CardFooter: React.lazy(() => import("@/components/ui/card").then(mod => ({ default: mod.CardFooter }))),

  // Dialog components
  Dialog: React.lazy(() => import("@/components/ui/dialog").then(mod => ({ default: mod.Dialog }))),
  DialogContent: React.lazy(() => import("@/components/ui/dialog").then(mod => ({ default: mod.DialogContent }))),
  DialogHeader: React.lazy(() => import("@/components/ui/dialog").then(mod => ({ default: mod.DialogHeader }))),
  DialogTitle: React.lazy(() => import("@/components/ui/dialog").then(mod => ({ default: mod.DialogTitle }))),
  DialogFooter: React.lazy(() => import("@/components/ui/dialog").then(mod => ({ default: mod.DialogFooter }))),
  DialogClose: React.lazy(() => import("@/components/ui/dialog").then(mod => ({ default: mod.DialogClose }))),

  // Other UI components
  Alert: React.lazy(() => import("@/components/ui/alert").then(mod => ({ default: mod.Alert }))),
  AlertDescription: React.lazy(() => import("@/components/ui/alert").then(mod => ({ default: mod.AlertDescription }))),
  Badge: React.lazy(() => import("@/components/ui/badge").then(mod => ({ default: mod.Badge }))),

  // Dropdown components
  DropdownMenu: React.lazy(() => import("@/components/ui/dropdown-menu").then(mod => ({ default: mod.DropdownMenu }))),
  DropdownMenuTrigger: React.lazy(() => import("@/components/ui/dropdown-menu").then(mod => ({ default: mod.DropdownMenuTrigger }))),
  DropdownMenuContent: React.lazy(() => import("@/components/ui/dropdown-menu").then(mod => ({ default: mod.DropdownMenuContent }))),
  DropdownMenuItem: React.lazy(() => import("@/components/ui/dropdown-menu").then(mod => ({ default: mod.DropdownMenuItem }))),
  DropdownMenuSeparator: React.lazy(() => import("@/components/ui/dropdown-menu").then(mod => ({ default: mod.DropdownMenuSeparator }))),

  // Tab components
  Tabs: React.lazy(() => import("@/components/ui/tabs").then(mod => ({ default: mod.Tabs }))),
  TabsList: React.lazy(() => import("@/components/ui/tabs").then(mod => ({ default: mod.TabsList }))),
  TabsTrigger: React.lazy(() => import("@/components/ui/tabs").then(mod => ({ default: mod.TabsTrigger }))),
};

// Date formatting utility functions
const formatDate = (timestamp) => {
  if (!timestamp) return "N/A";
  const date = new Date(Number(timestamp));
  return isNaN(date.getTime()) ? "N/A" : date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const formatTimeAgo = (timestamp) => {
  if (!timestamp) return "N/A";
  const date = new Date(Number(timestamp));
  return isNaN(date.getTime()) ? "N/A" : date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

// Projects API hook - separated for better organization
const useProjectsApi = () => {
  const projects = useRecoilValue(projectsAtom);
  const setProjects = useSetRecoilState(projectsAtom);
  const setProject = useSetRecoilState(projectAtom);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [state, setState] = useState({ isLoading: false, errors: {}, hasFetched: false });

  const validateToken = useCallback(() => {
    const token = localStorage.getItem("token");
    if (!token || !user) {
      navigate('/');
      return false;
    }
    return true;
  }, [user, navigate]);

  const fetchProjects = useCallback(async (force = true) => {
    if (!validateToken()) return;

    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const newData = await apiMethods.listProjects();
      const cacheKey = "projects";

      cache.set(cacheKey, newData);
      if (!deepEqual(projects, newData)) {
        setProjects(newData);
      }
      setState(prev => ({ ...prev, isLoading: false, hasFetched: true }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        errors: { fetch: error.message || "Failed to fetch projects" },
        isLoading: false,
        hasFetched: true
      }));
    }
  }, [projects, setProjects, validateToken]);

  const createProject = useCallback(async (name, description) => {
    if (!validateToken() || !name.trim() || !description.trim()) return false;
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const projectData = { name, description, owner_id: user?.id };
      const newProject = await apiMethods.createProject(projectData);
      setProjects(prev => [...prev, newProject]);
      setProject(newProject);
      navigate(`/project/${newProject.id}`);
      setState(prev => ({ ...prev, isLoading: false }));

      await fetchProjects();
      return true;
    } catch (error) {
      setState(prev => ({
        ...prev,
        errors: { create: error.message || "Failed to create project" },
        isLoading: false
      }));
      return false;
    }
  }, [validateToken, user, setProjects, setProject, navigate, fetchProjects]);

  const renameProject = useCallback(async (projectId, newName) => {
    if (!validateToken() || !newName.trim()) return false;
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const updatedProject = await apiMethods.updateProject(projectId, { name: newName });
      setProjects(prev => prev.map(p => p.id === projectId ? updatedProject : p));
      setState(prev => ({ ...prev, isLoading: false }));

      await fetchProjects();
      return true;
    } catch (error) {
      setState(prev => ({
        ...prev,
        errors: { rename: error.message || "Failed to rename project" },
        isLoading: false
      }));
      return false;
    }
  }, [validateToken, setProjects, fetchProjects]);

  const deleteProject = useCallback(async (projectId) => {
    if (!validateToken()) return false;
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      await apiMethods.deleteProject(projectId);
      setProjects(prev => prev.filter(p => p.id !== projectId));
      setState(prev => ({ ...prev, isLoading: false }));

      await fetchProjects();
      return true;
    } catch (error) {
      setState(prev => ({
        ...prev,
        errors: { delete: error.message || "Failed to delete project" },
        isLoading: false
      }));
      return false;
    }
  }, [validateToken, setProjects, fetchProjects]);

  const clearError = useCallback((key) => {
    setState(prev => {
      const newErrors = { ...prev.errors };
      delete newErrors[key];
      return { ...prev, errors: newErrors };
    });
  }, []);

  return { projects, ...state, fetchProjects, createProject, renameProject, deleteProject, clearError, setProject };
};

// Project Card Component - enhanced professional design with adaptive width
const ProjectCard = memo(({ project, onSelect, onRename, onDelete }: any) => {
  return (
    <UI.Card
      className="bg-[#191d23]/90 backdrop-blur-sm border border-gray-800/30 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer rounded-xl overflow-hidden w-full"
      onClick={() => onSelect(project)}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-gray-800/10 to-transparent pointer-events-none" />

      <UI.CardHeader className="pb-1 relative">
        <div className="absolute top-0 right-0 h-1 w-24 bg-gradient-to-r from-transparent via-gray-600/30 to-transparent" />
        <UI.CardTitle className="flex justify-between items-center gap-2">
          <div className="text-lg font-medium text-gray-100 truncate">{project.name}</div>
          <UI.DropdownMenu>
            <UI.DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
              <UI.Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full hover:bg-gray-800/50 transition-colors">
                <MoreVertical className="h-4 w-4 text-gray-400" />
              </UI.Button>
            </UI.DropdownMenuTrigger>
            <UI.DropdownMenuContent align="end" className="bg-[#191d23]/95 backdrop-blur border border-gray-800/50 text-gray-200 rounded-lg shadow-xl">
              <UI.DropdownMenuItem
                onClick={e => {
                  e.stopPropagation();
                  onRename(project);
                }}
                className="flex items-center hover:bg-gray-800/50 transition-colors focus:bg-gray-800/50"
              >
                <Pencil className="h-4 w-4 mr-2 text-gray-400" />
                Rename
              </UI.DropdownMenuItem>
              <UI.DropdownMenuSeparator className="bg-gray-700/50" />
              <UI.DropdownMenuItem
                className="flex items-center text-red-400 hover:bg-red-950/30 focus:bg-red-950/30 transition-colors"
                onClick={e => {
                  e.stopPropagation();
                  onDelete(project);
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </UI.DropdownMenuItem>
            </UI.DropdownMenuContent>
          </UI.DropdownMenu>
        </UI.CardTitle>
        <UI.CardDescription className="text-sm text-gray-400 truncate mt-1">{project.description}</UI.CardDescription>
      </UI.CardHeader>

      <UI.CardContent className="pt-0">
        <div className="flex flex-col space-y-2 text-xs sm:text-sm text-gray-400">
          <div className="flex items-center">
            <Calendar className="h-3.5 w-3.5 mr-1.5 text-gray-500" />
            <span className="truncate">Created {formatDate(project.created_at)}</span>
          </div>
          <div className="flex items-center">
            <Clock className="h-3.5 w-3.5 mr-1.5 text-gray-500" />
            <span className="truncate">Updated {formatTimeAgo(project.updated_at)}</span>
          </div>
        </div>
      </UI.CardContent>

      <UI.CardFooter className="pt-2 pb-4 flex flex-wrap gap-3 sm:gap-4 items-center">
        <div className="flex items-center gap-1.5">
          <GitBranch className="h-3.5 w-3.5 text-gray-500" />
          <UI.Badge variant="outline" className="bg-gray-800/30 backdrop-blur-sm border-gray-700/30 text-gray-300 text-xs px-2 py-0 h-5">
            {project.repo_count || 0} repos
          </UI.Badge>
        </div>
        <div className="flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5 text-gray-500" />
          <UI.Badge variant="outline" className="bg-gray-800/30 backdrop-blur-sm border-gray-700/30 text-gray-300 text-xs px-2 py-0 h-5">
            {project.collaborator_count || 0} collaborators
          </UI.Badge>
        </div>
        <UI.Button
          onClick={e => {
            e.stopPropagation();
            onSelect(project);
          }}
          className="ml-auto bg-gradient-to-r from-[#00ff9d] to-[#00e88d] text-gray-900 hover:from-[#00ff9d]/90 hover:to-[#00e88d]/90 rounded-full h-8 px-4 text-xs font-medium transition-all shadow-md hover:shadow-lg flex items-center gap-1"
        >
          <span>View</span>
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </UI.Button>
      </UI.CardFooter>
    </UI.Card>
  );
});



// Project Skeleton - updated to match the new UI dimensions
const ProjectCardSkeleton = memo(() => (
  <div className="bg-[#191d23] shadow-md rounded-lg overflow-hidden h-[200px]">
    <div className="p-6 pb-2">
      <div className="flex justify-between items-center">
        <div className="w-36 h-6 bg-[#2a2a2a] animate-pulse rounded"></div>
        <div className="w-8 h-8 rounded-full bg-[#2a2a2a] animate-pulse"></div>
      </div>
      <div className="w-full h-4 mt-2 bg-[#2a2a2a] animate-pulse rounded"></div>
    </div>

    <div className="px-6 py-2">
      <div className="space-y-2">
        <div className="flex items-center">
          <div className="w-4 h-4 mr-2 bg-[#2a2a2a] animate-pulse rounded-full"></div>
          <div className="w-32 h-4 bg-[#2a2a2a] animate-pulse rounded"></div>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 mr-2 bg-[#2a2a2a] animate-pulse rounded-full"></div>
          <div className="w-24 h-4 bg-[#2a2a2a] animate-pulse rounded"></div>
        </div>
      </div>
    </div>

    <div className="px-6 py-4 flex justify-between items-center">
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-[#2a2a2a] animate-pulse rounded-full"></div>
        <div className="w-16 h-4 bg-[#2a2a2a] animate-pulse rounded"></div>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-[#2a2a2a] animate-pulse rounded-full"></div>
        <div className="w-20 h-4 bg-[#2a2a2a] animate-pulse rounded"></div>
      </div>
      <div className="w-16 h-8 bg-[#2a2a2a] animate-pulse rounded-full"></div>
    </div>
  </div>
));

// ProjectsGridSkeleton with exact dimensions
const ProjectsGridSkeleton = memo(() => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
      {Array(3).fill().map((_, i) => (
        <ProjectCardSkeleton key={i} />
      ))}
    </div>
  );
});

// Main ProjectsSection component
const ProjectsSection = memo(() => {
  const [state, setState] = useState({
    createDialogOpen: false,
    renameDialogOpen: false,
    deleteDialogOpen: false,
    selectedProject: null,
    searchTerm: "",
    filter: "all",
    sort: "last_updated",
    viewMode: "grid",
    newName: "",
    newDescription: ""
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
    setProject
  } = useProjectsApi();

  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [debouncedSearchTerm] = useDebounce(state.searchTerm, 300);

  // Filtered projects with memoization
  const filteredProjects = useMemo(() => {
    let filtered = projects || [];

    // Search filtering
    if (debouncedSearchTerm) {
      const lowercaseSearch = debouncedSearchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(lowercaseSearch) ||
        p.description.toLowerCase().includes(lowercaseSearch)
      );
    }

    // Sort based on sort option
    switch (state.sort) {
      case "last_updated":
        return [...filtered].sort((a, b) => (b.updated_at || 0) - (a.updated_at || 0));
      case "created":
        return [...filtered].sort((a, b) => (a.created_at || 0) - (b.created_at || 0));
      default:
        return filtered;
    }
  }, [projects, debouncedSearchTerm, state.sort]);

  // Fetch projects on component mount or path change
  useEffect(() => {
    if (!hasFetched || location.pathname === "/projects") {
      fetchProjects();
    }
  }, [fetchProjects, hasFetched, location.pathname]);

  // Action handlers
  const handleCreateProject = useCallback(async () => {
    const success = await createProject(state.newName, state.newDescription);
    if (success) {
      setState(prev => ({
        ...prev,
        createDialogOpen: false,
        newName: "",
        newDescription: ""
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

  const handleSelectProject = useCallback((project) => {
    setProject(project);
    navigate(`/project/${project.id}`);
  }, [setProject, navigate]);

  // Open rename dialog handler
  const openRenameDialog = useCallback((project) => {
    setState(prev => ({
      ...prev,
      selectedProject: project,
      renameDialogOpen: true
    }));
  }, []);

  // Open delete dialog handler
  const openDeleteDialog = useCallback((project) => {
    setState(prev => ({
      ...prev,
      selectedProject: project,
      deleteDialogOpen: true
    }));
  }, []);

  return (
    <Suspense fallback={<ProjectsGridSkeleton />}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-4xl font-bold capitalize bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-500 to-white">
                {user?.name ? `${user.name}'s Projects` : 'My Projects'}
              </h1>
              <p className="text-gray-400 mt-1 text-sm">Manage your DocGen projects</p>
            </div>
            <UI.Button
              onClick={() => setState(prev => ({ ...prev, createDialogOpen: true }))}
              className="bg-[#00ff9d] hover:bg-[#00ff9d]/90 text-black px-4 py-2 rounded-full flex items-center gap-2 transition-colors text-sm font-medium"
            >
              <Plus className="h-5 w-5" />
              Create Project
            </UI.Button>
          </div>

          {/* Search and Filters Row */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <UI.Input
                placeholder="Search projects..."
                value={state.searchTerm}
                onChange={e => setState(prev => ({ ...prev, searchTerm: e.target.value }))}
                className="pl-10 pr-10 py-2 bg-transparent border border-gray-700 text-gray-200 rounded-md w-full text-sm"
              />
              {state.searchTerm && (
                <X
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 hover:text-white cursor-pointer"
                  onClick={() => setState(prev => ({ ...prev, searchTerm: "" }))}
                />
              )}
            </div>

            <div className="flex gap-3">
              <UI.DropdownMenu>
                <UI.DropdownMenuTrigger asChild>
                  <UI.Button variant="outline" className="border-gray-700 bg-transparent text-gray-200 hover:bg-gray-700 flex items-center gap-2 text-sm">
                    All Projects
                    <Filter className="h-4 w-4" />
                  </UI.Button>
                </UI.DropdownMenuTrigger>
                <UI.DropdownMenuContent className="bg-[#191d23] border border-gray-700 text-gray-200">
                  <UI.DropdownMenuItem onClick={() => setState(prev => ({ ...prev, filter: "all" }))}>All Projects</UI.DropdownMenuItem>
                </UI.DropdownMenuContent>
              </UI.DropdownMenu>

              <UI.DropdownMenu>
                <UI.DropdownMenuTrigger asChild>
                  <UI.Button variant="outline" className="border-gray-700 bg-transparent text-gray-200 hover:bg-gray-700 flex items-center gap-2 text-sm">
                    {state.sort === "last_updated" ? "Last Updated" : "Created"}
                    <Filter className="h-4 w-4" />
                  </UI.Button>
                </UI.DropdownMenuTrigger>
                <UI.DropdownMenuContent className="bg-[#191d23] border border-gray-700 text-gray-200">
                  <UI.DropdownMenuItem onClick={() => setState(prev => ({ ...prev, sort: "last_updated" }))}>Last Updated</UI.DropdownMenuItem>
                  <UI.DropdownMenuItem onClick={() => setState(prev => ({ ...prev, sort: "created" }))}>Created</UI.DropdownMenuItem>
                </UI.DropdownMenuContent>
              </UI.DropdownMenu>
            </div>
          </div>
        </header>

        {/* Error Message */}
        {errors.fetch && (
          <UI.Alert className="bg-red-900/20 border border-red-700 text-red-300 mb-6 rounded-md">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-3 text-red-400" />
              <UI.AlertDescription className="text-sm font-medium flex-1">
                {errors.fetch}
              </UI.AlertDescription>
              <UI.Button
                variant="outline"
                size="sm"
                onClick={() => clearError('fetch')}
                className="border-red-700 hover:bg-red-900/30 text-red-300"
              >
                Dismiss
              </UI.Button>
            </div>
          </UI.Alert>
        )}

        {/* Projects Content */}
        {isLoading && !hasFetched ? (
          <ProjectsGridSkeleton />
        ) : filteredProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 bg-[#191d23] rounded-lg border border-gray-700">
            <FolderSearch className="h-12 w-12 mb-4 text-gray-500" />
            <h3 className="text-xl font-medium text-gray-300 mb-2 text-center">
              {debouncedSearchTerm ? "No matching projects found" : "No projects yet"}
            </h3>
            <p className="text-gray-400 text-center max-w-md mb-6">
              {debouncedSearchTerm
                ? `Try adjusting your search term or create a new project.`
                : `Get started by creating your first project.`}
            </p>
            <UI.Button
              onClick={() => setState(prev => ({ ...prev, createDialogOpen: true }))}
              className="bg-[#00ff9d] hover:bg-[#00ff9d]/90 text-black rounded-full flex items-center gap-2 transition-colors text-sm font-medium px-4 py-2"
            >
              <Plus className="h-5 w-5" />
              Create New Project
            </UI.Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 w-full p-4">
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

        {/* Create Project Dialog */}
        <UI.Dialog open={state.createDialogOpen} onOpenChange={open => setState(prev => ({ ...prev, createDialogOpen: open }))}>
          <UI.DialogContent className="bg-[#191d23] border border-gray-700 text-gray-200 sm:max-w-md">
            <UI.DialogHeader>
              <UI.DialogTitle className="text-white">Create New Project</UI.DialogTitle>
            </UI.DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <UI.Label htmlFor="projectName" className="text-sm font-medium text-gray-300">
                  Project Name
                </UI.Label>
                <UI.Input
                  id="projectName"
                  placeholder="Enter project name"
                  value={state.newName}
                  onChange={e => setState(prev => ({ ...prev, newName: e.target.value }))}
                  className="bg-[#2a2a2a] border-gray-700 text-gray-200"
                />
              </div>

              <div className="space-y-2">
                <UI.Label htmlFor="projectDescription" className="text-sm font-medium text-gray-300">
                  Description
                </UI.Label>
                <UI.Input
                  id="projectDescription"
                  placeholder="Enter project description"
                  value={state.newDescription}
                  onChange={e => setState(prev => ({ ...prev, newDescription: e.target.value }))}
                  className="bg-[#2a2a2a] border-gray-700 text-gray-200"
                />
              </div>

              {errors.create && (
                <UI.Alert className="bg-red-900/20 border border-red-700 text-red-300">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  <UI.AlertDescription>{errors.create}</UI.AlertDescription>
                </UI.Alert>
              )}
            </div>

            <UI.DialogFooter>
              <UI.DialogClose asChild>
                <UI.Button variant="outline" className="border-gray-700 hover:bg-[#2a2a2a] text-gray-300">
                  Cancel
                </UI.Button>
              </UI.DialogClose>
              <UI.Button
                onClick={handleCreateProject}
                disabled={!state.newName.trim() || !state.newDescription.trim() || isLoading}
                className="bg-[#00ff9d] hover:bg-[#00ff9d]/90 text-black rounded-full"
              >
                {isLoading ? <Loader className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                Create Project
              </UI.Button>
            </UI.DialogFooter>
          </UI.DialogContent>
        </UI.Dialog>

        {/* Rename Project Dialog */}
        <UI.Dialog open={state.renameDialogOpen} onOpenChange={open => setState(prev => ({ ...prev, renameDialogOpen: open }))}>
          <UI.DialogContent className="bg-[#191d23] border border-gray-700 text-gray-200 sm:max-w-md">
            <UI.DialogHeader>
              <UI.DialogTitle className="text-white">Rename Project</UI.DialogTitle>
            </UI.DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <UI.Label htmlFor="newProjectName" className="text-sm font-medium text-gray-300">
                  New Project Name
                </UI.Label>
                <UI.Input
                  id="newProjectName"
                  placeholder="Enter new name"
                  value={state.selectedProject?.name || ""}
                  onChange={e => setState(prev => ({
                    ...prev,
                    selectedProject: { ...prev.selectedProject, name: e.target.value }
                  }))}
                  className="bg-[#2a2a2a] border-gray-700 text-gray-200"
                />
              </div>

              {errors.rename && (
                <UI.Alert className="bg-red-900/20 border border-red-700 text-red-300">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  <UI.AlertDescription>{errors.rename}</UI.AlertDescription>
                </UI.Alert>
              )}
            </div>

            <UI.DialogFooter>
              <UI.DialogClose asChild>
                <UI.Button variant="outline" className="border-gray-700 hover:bg-[#2a2a2a] text-gray-300">
                  Cancel
                </UI.Button>
              </UI.DialogClose>
              <UI.Button
                onClick={handleRenameProject}
                disabled={!state.selectedProject?.name.trim() || isLoading}
                className="bg-[#00ff9d] hover:bg-[#00ff9d]/90 text-black rounded-full"
              >
                {isLoading ? <Loader className="h-4 w-4 mr-2 animate-spin" /> : <Pencil className="h-4 w-4 mr-2" />}
                Rename
              </UI.Button>
            </UI.DialogFooter>
          </UI.DialogContent>
        </UI.Dialog>

        {/* Delete Project Dialog */}
        <UI.Dialog open={state.deleteDialogOpen} onOpenChange={open => setState(prev => ({ ...prev, deleteDialogOpen: open }))}>
          <UI.DialogContent className="bg-[#191d23] border border-gray-700 text-gray-200 sm:max-w-md">
            <UI.DialogHeader>
              <UI.DialogTitle className="text-red-400">Delete Project</UI.DialogTitle>
            </UI.DialogHeader>

            <div className="py-4">
              <p className="text-gray-300">
                Are you sure you want to delete project <span className="font-medium text-white">{state.selectedProject?.name}</span>?
              </p>
              <p className="text-gray-400 text-sm mt-2">
                This action cannot be undone and all associated data will be permanently removed.
              </p>

              {errors.delete && (
                <UI.Alert className="bg-red-900/20 border border-red-700 text-red-300 mt-4">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  <UI.AlertDescription>{errors.delete}</UI.AlertDescription>
                </UI.Alert>
              )}
            </div>

            <UI.DialogFooter>
              <UI.DialogClose asChild>
                <UI.Button variant="outline" className="border-gray-700 hover:bg-[#2a2a2a] text-gray-300">
                  Cancel
                </UI.Button>
              </UI.DialogClose>
              <UI.Button
                onClick={handleDeleteProject}
                disabled={isLoading}
                className="bg-red-600 hover:bg-red-700 text-white rounded-full"
              >
                {isLoading ? <Loader className="h-4 w-4 mr-2 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />}
                Delete Project
              </UI.Button>
            </UI.DialogFooter>
          </UI.DialogContent>
        </UI.Dialog>
      </div>
    </Suspense>
  );
});

export default ProjectsSection;