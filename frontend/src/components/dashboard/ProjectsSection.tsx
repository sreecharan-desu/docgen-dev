import React, { useState, useEffect, useCallback, memo, Suspense, useMemo } from "react";
import * as LucideIcons from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { projectAtom, projectsAtom } from "@/store/store";
import { useSetRecoilState, useRecoilState } from "recoil";
import { useAuth } from "@/contexts/AuthContext";
import { useDebounce } from "use-debounce";

// Lazy-loaded component imports
const UI = {
  Button: React.lazy(() => import("@/components/ui/button").then(mod => ({ default: mod.Button }))),
  Input: React.lazy(() => import("@/components/ui/input").then(mod => ({ default: mod.Input }))),
  Label: React.lazy(() => import("@/components/ui/label").then(mod => ({ default: mod.Label }))),
  Card: React.lazy(() => import("@/components/ui/card").then(mod => ({ default: mod.Card }))),
  CardContent: React.lazy(() => import("@/components/ui/card").then(mod => ({ default: mod.CardContent }))),
  CardHeader: React.lazy(() => import("@/components/ui/card").then(mod => ({ default: mod.CardHeader }))),
  CardTitle: React.lazy(() => import("@/components/ui/card").then(mod => ({ default: mod.CardTitle }))),
  CardDescription: React.lazy(() => import("@/components/ui/card").then(mod => ({ default: mod.CardDescription }))),
  CardFooter: React.lazy(() => import("@/components/ui/card").then(mod => ({ default: mod.CardFooter }))),
  Dialog: React.lazy(() => import("@/components/ui/dialog").then(mod => ({ default: mod.Dialog }))),
  DialogContent: React.lazy(() => import("@/components/ui/dialog").then(mod => ({ default: mod.DialogContent }))),
  DialogHeader: React.lazy(() => import("@/components/ui/dialog").then(mod => ({ default: mod.DialogHeader }))),
  DialogTitle: React.lazy(() => import("@/components/ui/dialog").then(mod => ({ default: mod.DialogTitle }))),
  DialogFooter: React.lazy(() => import("@/components/ui/dialog").then(mod => ({ default: mod.DialogFooter }))),
  DialogClose: React.lazy(() => import("@/components/ui/dialog").then(mod => ({ default: mod.DialogClose }))),
  Alert: React.lazy(() => import("@/components/ui/alert").then(mod => ({ default: mod.Alert }))),
  AlertDescription: React.lazy(() => import("@/components/ui/alert").then(mod => ({ default: mod.AlertDescription }))),
  Badge: React.lazy(() => import("@/components/ui/badge").then(mod => ({ default: mod.Badge }))),
  DropdownMenu: React.lazy(() => import("@/components/ui/dropdown-menu").then(mod => ({ default: mod.DropdownMenu }))),
  DropdownMenuTrigger: React.lazy(() => import("@/components/ui/dropdown-menu").then(mod => ({ default: mod.DropdownMenuTrigger }))),
  DropdownMenuContent: React.lazy(() => import("@/components/ui/dropdown-menu").then(mod => ({ default: mod.DropdownMenuContent }))),
  DropdownMenuItem: React.lazy(() => import("@/components/ui/dropdown-menu").then(mod => ({ default: mod.DropdownMenuItem }))),
  DropdownMenuSeparator: React.lazy(() => import("@/components/ui/dropdown-menu").then(mod => ({ default: mod.DropdownMenuSeparator })))
};

// Deep equality check function
const deepEqual = (obj1, obj2) => {
  if (obj1 === obj2) return true;
  if (!obj1 || !obj2 || typeof obj1 !== 'object' || typeof obj2 !== 'object') return false;
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  if (keys1.length !== keys2.length) return false;
  return keys1.every(key => deepEqual(obj1[key], obj2[key]));
};


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

const BASE_URL = "https://api2.docgen.dev/api/v1/project";
const JWT_TOKEN = localStorage.getItem("token");

const formatDate = (timestamp) => {
  if (!timestamp) return "N/A";
  const date = new Date(Number(timestamp));
  return isNaN(date.getTime()) ? "N/A" : date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
};

// Custom hook for API operations
const useProjectsApi = () => {
  const [projects, setProjects] = useRecoilState(projectsAtom);
  const setProject = useSetRecoilState(projectAtom);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [state, setState] = useState({ isLoading: false, errors: {}, hasFetched: false });

  const handleApiError = useCallback((key, error) => {
    setState(prev => ({ ...prev, errors: { ...prev.errors, [key]: error.message }, isLoading: false }));
    return false;
  }, []);

  useEffect(()=>{
    if((user == null) || (localStorage.getItem("token") === undefined) || localStorage.getItem("token") == null){
      navigate('/')
    }
  },[])

  const fetchProjects = useCallback(async (force = false) => {

    try {
      const newData = await apiCall(`${BASE_URL}/list-projects`, {
        method: "GET",
        headers: { Authorization: `Bearer ${JWT_TOKEN}`, "Content-Type": "application/json" }
      });
      setState(prev => {
        if (force || !deepEqual(projects, newData)) {
          setProjects(newData);
          return { ...prev, hasFetched: true };
        }
        return { ...prev, hasFetched: true };
      });
      return true;
    } catch (error) {
      return handleApiError('fetch', error);
    }
  }, [projects, navigate, handleApiError]);

  const createProject = useCallback(async (name, description) => {
    if (!name.trim() || !description.trim()) {
      setState(prev => ({ ...prev, errors: { ...prev.errors, create: "Fields cannot be empty" } }));
      return false;
    }
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const projectData = { name, description, owner_id: user?.id };
      const newProject = await apiCall(`${BASE_URL}/create-project`, {
        method: "POST",
        headers: { Authorization: `Bearer ${JWT_TOKEN}`, "Content-Type": "application/json" },
        body: JSON.stringify(projectData)
      });
      setProjects(prev => [...prev, newProject]);
      setProject(newProject);
      navigate(`/project/${newProject.id}`);
      setState(prev => ({ ...prev, isLoading: false }));
      return true;
    } catch (error) {
      return handleApiError('create', error);
    }
  }, [user, navigate, setProjects, setProject, handleApiError]);

  const renameProject = useCallback(async (projectId, newName) => {
    if (!newName.trim()) {
      setState(prev => ({ ...prev, errors: { ...prev.errors, rename: "Name cannot be empty" } }));
      return false;
    }
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const updatedProject = await apiCall(`${BASE_URL}/update-project/${projectId}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${JWT_TOKEN}`, "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName })
      });
      setProjects(prev => prev.map(p => p.id === projectId ? updatedProject : p));
      setState(prev => ({ ...prev, isLoading: false }));
      return true;
    } catch (error) {
      return handleApiError('rename', error);
    }
  }, [setProjects, handleApiError]);

  const deleteProject = useCallback(async (projectId) => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      await apiCall(`${BASE_URL}/delete-project/${projectId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${JWT_TOKEN}`, "Content-Type": "application/json" }
      });
      setProjects(prev => prev.filter(p => p.id !== projectId));
      setState(prev => ({ ...prev, isLoading: false }));
      return true;
    } catch (error) {
      return handleApiError('delete', error);
    }
  }, [setProjects, handleApiError]);

  const clearError = useCallback((key) => {
    setState(prev => {
      const newErrors = { ...prev.errors };
      delete newErrors[key];
      return { ...prev, errors: newErrors };
    });
  }, []);

  return { projects, ...state, fetchProjects, createProject, renameProject, deleteProject, clearError, setProject };
};

// Memoized Components
const SearchHeader = memo(({ searchTerm, setSearchTerm, onCreateClick }) => (
  <header className="mb-8">
    <div className="flex justify-between items-center mb-4">
      <div>
        <h1 className="text-3xl font-bold mb-2">Projects</h1>
        <p className="text-muted-foreground">Manage your DocGen projects</p>
      </div>
      <UI.Button onClick={onCreateClick}><LucideIcons.Plus className="h-4 w-4 mr-2" />Create Project</UI.Button>
    </div>
    <div className="relative flex-1">
      <LucideIcons.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <UI.Input
        placeholder="Search projects..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        className="pl-10 pr-10 w-full"
      />
      {searchTerm && (
        <LucideIcons.X
          className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground cursor-pointer"
          onClick={() => setSearchTerm("")}
        />
      )}
    </div>
  </header>
));

const ProjectCard = memo(({ project, onSelect, onRename, onDelete }) => (
  <UI.Card
    className="overflow-hidden shadow-lg transition-all duration-300 ease-in-out hover:shadow-xl hover:scale-[1.02] cursor-pointer border border-border bg-background rounded-2xl"
    onClick={() => onSelect(project)}
  >
    <UI.CardHeader className="pb-3">
      <UI.CardTitle className="flex justify-between items-center text-lg font-semibold text-foreground">
        <span className="truncate">{project.name}</span>
        <UI.DropdownMenu>
          <UI.DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
            <UI.Button variant="ghost" size="sm" className="h-8 w-8 p-0"><LucideIcons.MoreVertical className="h-4 w-4" /></UI.Button>
          </UI.DropdownMenuTrigger>
          <UI.DropdownMenuContent align="end">
            <UI.DropdownMenuItem onClick={e => { e.stopPropagation(); onRename(project); }}>
              <LucideIcons.Pencil className="h-4 w-4 mr-2" />Rename
            </UI.DropdownMenuItem>
            <UI.DropdownMenuSeparator />
            <UI.DropdownMenuItem className="text-destructive" onClick={e => { e.stopPropagation(); onDelete(project); }}>
              <LucideIcons.Trash2 className="h-4 w-4 mr-2" />Delete
            </UI.DropdownMenuItem>
          </UI.DropdownMenuContent>
        </UI.DropdownMenu>
      </UI.CardTitle>
      <UI.CardDescription className="truncate text-muted-foreground text-sm">{project.description}</UI.CardDescription>
    </UI.CardHeader>
    <UI.CardContent className="pb-3 space-y-2">
      <div className="flex items-center text-sm text-muted-foreground">
        <LucideIcons.Clock className="h-4 w-4 mr-1 text-primary" />Created: {formatDate(project.created_at)}
      </div>
      <div className="flex items-center text-sm text-muted-foreground">
        <LucideIcons.Clock className="h-4 w-4 mr-1 text-primary" />Updated: {formatDate(project.updated_at) || "Never"}
      </div>
    </UI.CardContent>
    <UI.CardFooter className="pt-2 border-t border-border bg-muted/40 rounded-b-2xl">
      <div className="flex justify-between w-full text-sm">
        <div className="flex items-center gap-1">
          <LucideIcons.GitBranch className="h-4 w-4 text-primary" />
          <UI.Badge variant="outline" className="px-2 py-1 text-xs font-medium">{project.repo_count} repos</UI.Badge>
        </div>
        <div className="flex items-center gap-1">
          <LucideIcons.Users className="h-4 w-4 text-primary" />
          <UI.Badge variant="outline" className="px-2 py-1 text-xs font-medium">{project.collaborator_count} collaborators</UI.Badge>
        </div>
      </div>
    </UI.CardFooter>
  </UI.Card>
));

const EmptyState = memo(({ onCreateClick }) => (
  <UI.Card className="overflow-hidden">
    <div className="h-1 bg-primary/20"></div>
    <UI.CardContent className="flex flex-col items-center justify-center py-12">
      <div className="rounded-full bg-primary/10 p-3 mb-4"><LucideIcons.FolderKanban className="h-6 w-6 text-primary" /></div>
      <h3 className="text-lg font-semibold mb-2">No Projects Yet</h3>
      <p className="text-muted-foreground text-center mb-4">Create your first project to get started.</p>
      <UI.Button onClick={onCreateClick}><LucideIcons.Plus className="h-4 w-4 mr-2" />Create Project</UI.Button>
    </UI.CardContent>
  </UI.Card>
));

const ErrorAlert = memo(({ message, onRetry }) => (
  <UI.Alert variant="destructive" className="mb-6">
    <LucideIcons.AlertCircle className="h-4 w-4 mr-2" />
    <UI.AlertDescription>
      {message}
      {onRetry && (
        <UI.Button variant="outline" size="sm" className="ml-4" onClick={onRetry}>
          <LucideIcons.RefreshCw className="h-4 w-4 mr-2" />Retry
        </UI.Button>
      )}
    </UI.AlertDescription>
  </UI.Alert>
));

const CreateProjectDialog = memo(({ open, onOpenChange, onCreate, isLoading, error, onClearError }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (!open) {
      setName("");
      setDescription("");
      onClearError('create');
    }
  }, [open, onClearError]);

  const handleSubmit = useCallback(() => onCreate(name, description), [name, description, onCreate]);

  return (
    <UI.Dialog open={open} onOpenChange={onOpenChange}>
      <UI.DialogContent className="sm:max-w-md">
        <UI.DialogHeader><UI.DialogTitle>Create New Project</UI.DialogTitle></UI.DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <UI.Label className="text-right">Name</UI.Label>
            <UI.Input value={name} onChange={e => setName(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <UI.Label className="text-right">Description</UI.Label>
            <UI.Input value={description} onChange={e => setDescription(e.target.value)} className="col-span-3" />
          </div>
          {error && <ErrorAlert message={error} onRetry={handleSubmit} />}
        </div>
        <UI.DialogFooter>
          <UI.DialogClose asChild><UI.Button variant="outline" disabled={isLoading}>Cancel</UI.Button></UI.DialogClose>
          <UI.Button onClick={handleSubmit} disabled={isLoading}>{isLoading ? "Creating..." : "Create"}</UI.Button>
        </UI.DialogFooter>
      </UI.DialogContent>
    </UI.Dialog>
  );
});

const RenameProjectDialog = memo(({ open, onOpenChange, selectedProject, onRename, isLoading, error, onClearError }) => {
  const [newName, setNewName] = useState("");

  useEffect(() => {
    if (selectedProject) setNewName(selectedProject.name);
    if (!open) onClearError('rename');
  }, [selectedProject, open, onClearError]);

  const handleSubmit = useCallback(() => selectedProject && onRename(selectedProject.id, newName), [selectedProject, newName, onRename]);

  return (
    <UI.Dialog open={open} onOpenChange={onOpenChange}>
      <UI.DialogContent className="sm:max-w-md">
        <UI.DialogHeader><UI.DialogTitle>Rename Project</UI.DialogTitle></UI.DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <UI.Label className="text-right">New Name</UI.Label>
            <UI.Input value={newName} onChange={e => setNewName(e.target.value)} className="col-span-3" />
          </div>
          {error && <ErrorAlert message={error} onRetry={handleSubmit} />}
        </div>
        <UI.DialogFooter>
          <UI.DialogClose asChild><UI.Button variant="outline" disabled={isLoading}>Cancel</UI.Button></UI.DialogClose>
          <UI.Button onClick={handleSubmit} disabled={isLoading}>{isLoading ? "Renaming..." : "Rename"}</UI.Button>
        </UI.DialogFooter>
      </UI.DialogContent>
    </UI.Dialog>
  );
});

const DeleteProjectDialog = memo(({ open, onOpenChange, selectedProject, onDelete, isLoading, error }) => {
  const handleSubmit = useCallback(() => selectedProject && onDelete(selectedProject.id), [selectedProject, onDelete]);

  return (
    <UI.Dialog open={open} onOpenChange={onOpenChange}>
      <UI.DialogContent className="sm:max-w-md">
        <UI.DialogHeader><UI.DialogTitle>Delete Project</UI.DialogTitle></UI.DialogHeader>
        <div className="py-4">
          <p className="text-muted-foreground">
            Are you sure you want to delete project <span className="font-semibold">{selectedProject?.name}</span>? This action cannot be undone.
          </p>
          {error && <ErrorAlert message={error} onRetry={handleSubmit} />}
        </div>
        <UI.DialogFooter>
          <UI.DialogClose asChild><UI.Button variant="outline" disabled={isLoading}>Cancel</UI.Button></UI.DialogClose>
          <UI.Button variant="destructive" onClick={handleSubmit} disabled={isLoading}>{isLoading ? "Deleting..." : "Delete"}</UI.Button>
        </UI.DialogFooter>
      </UI.DialogContent>
    </UI.Dialog>
  );
});

const ProjectsGridSkeleton = memo(() => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array(3).fill().map((_, idx) => (
      <div key={`skeleton-${idx}`} className="animate-pulse">
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

const ProjectsSection = memo(() => {
  const [state, setState] = useState({
    createDialogOpen: false,
    renameDialogOpen: false,
    deleteDialogOpen: false,
    selectedProject: null,
    searchTerm: ""
  });
  const { projects, isLoading, errors, hasFetched, fetchProjects, createProject, renameProject, deleteProject, clearError, setProject } = useProjectsApi();
  const navigate = useNavigate();
  const location = useLocation();
  const [debouncedSearchTerm] = useDebounce(state.searchTerm, 300);

  const filteredProjects = useMemo(() => {
    if (!debouncedSearchTerm) return projects;
    const lowercaseSearch = debouncedSearchTerm.toLowerCase();
    return projects.filter(p => p.name.toLowerCase().includes(lowercaseSearch) || p.description.toLowerCase().includes(lowercaseSearch));
  }, [projects, debouncedSearchTerm]);

  useEffect(() => {
    if (!hasFetched) fetchProjects(true);
  }, [hasFetched, fetchProjects]);

  useEffect(() => {
    if (hasFetched) fetchProjects();
  }, [location.pathname, hasFetched, fetchProjects]);

  const handleCreateProject = useCallback(async (name, description) => {
    const success = await createProject(name, description);
    if (success) setState(prev => ({ ...prev, createDialogOpen: false }));
  }, [createProject]);

  const handleRenameProject = useCallback(async (projectId, newName) => {
    const success = await renameProject(projectId, newName);
    if (success) setState(prev => ({ ...prev, renameDialogOpen: false, selectedProject: null }));
  }, [renameProject]);

  const handleDeleteProject = useCallback(async (projectId) => {
    const success = await deleteProject(projectId);
    if (success) setState(prev => ({ ...prev, deleteDialogOpen: false, selectedProject: null }));
  }, [deleteProject]);

  const handleSelectProject = useCallback((project) => {
    setProject(project);
    navigate(`/project/${project.id}`);
  }, [setProject, navigate]);

  return (
    <Suspense fallback={<ProjectsGridSkeleton />}>
      <div className="space-y-6 p-10 mt-8">
        <SearchHeader
          searchTerm={state.searchTerm}
          setSearchTerm={value => setState(prev => ({ ...prev, searchTerm: value }))}
          onCreateClick={() => setState(prev => ({ ...prev, createDialogOpen: true }))}
        />

        {errors.fetch && <ErrorAlert message={errors.fetch} onRetry={() => fetchProjects(true)} />}

        {!hasFetched ? (
          <ProjectsGridSkeleton />
        ) : filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map(project => (
              <ProjectCard
                key={project.id}
                project={project}
                onSelect={handleSelectProject}
                onRename={project => setState(prev => ({ ...prev, selectedProject: project, renameDialogOpen: true }))}
                onDelete={project => setState(prev => ({ ...prev, selectedProject: project, deleteDialogOpen: true }))}
              />
            ))}
          </div>
        ) : projects.length > 0 ? (
          <div className="text-center py-8 text-muted-foreground">No projects match your search criteria</div>
        ) : (
          <EmptyState onCreateClick={() => setState(prev => ({ ...prev, createDialogOpen: true }))} />
        )}

        <CreateProjectDialog
          open={state.createDialogOpen}
          onOpenChange={open => setState(prev => ({ ...prev, createDialogOpen: open }))}
          onCreate={handleCreateProject}
          isLoading={isLoading}
          error={errors.create}
          onClearError={clearError}
        />

        <RenameProjectDialog
          open={state.renameDialogOpen}
          onOpenChange={open => setState(prev => ({ ...prev, renameDialogOpen: open }))}
          selectedProject={state.selectedProject}
          onRename={handleRenameProject}
          isLoading={isLoading}
          error={errors.rename}
          onClearError={clearError}
        />

        <DeleteProjectDialog
          open={state.deleteDialogOpen}
          onOpenChange={open => setState(prev => ({ ...prev, deleteDialogOpen: open }))}
          selectedProject={state.selectedProject}
          onDelete={handleDeleteProject}
          isLoading={isLoading}
          error={errors.delete}
        />
      </div>
    </Suspense>
  );
});

export default ProjectsSection;