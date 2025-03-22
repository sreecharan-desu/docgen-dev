import { useState, useEffect, useCallback, memo, Suspense, useMemo } from "react";
import { useProjectsApi } from "./apis/projectsApi";
import { useNavigate } from "react-router-dom";
import { useDebounce } from "use-debounce";
import { 
  CreateProjectDialog, 
  DeleteProjectDialog, 
  EmptyState, 
  ErrorAlert, 
  ProjectCard, 
  ProjectsGridSkeleton, 
  RenameProjectDialog, 
  SearchHeader 
} from "./components/components";

interface Project {
  id: string;
  name: string;
  description: string;
}

interface ProjectsSectionState {
  createDialogOpen: boolean;
  renameDialogOpen: boolean;
  deleteDialogOpen: boolean;
  selectedProject: Project | null;
  searchTerm: string;
}

const ProjectsSection = memo(() => {
  const [state, setState] = useState<ProjectsSectionState>({
    createDialogOpen: false,
    renameDialogOpen: false,
    deleteDialogOpen: false,
    selectedProject: null,
    searchTerm: ""
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
  
  const navigate = useNavigate();
  const [debouncedSearchTerm] = useDebounce(state.searchTerm, 300);

  // Filter projects based on search term
  const filteredProjects = useMemo(() => {
    if (!debouncedSearchTerm) return projects;
    
    const lowercaseSearch = debouncedSearchTerm.toLowerCase();
    return projects.filter((project: Project) => 
      project.name.toLowerCase().includes(lowercaseSearch) || 
      project.description.toLowerCase().includes(lowercaseSearch)
    );
  }, [projects, debouncedSearchTerm]);

  // Fetch projects on initial load
  useEffect(() => {
    if (!hasFetched) {
      fetchProjects(true);
    }
  }, [hasFetched, fetchProjects]);

  // Handler functions
  const handleCreateProject = useCallback((name: string, description: string) => {
    createProject(name, description).then((success: boolean) => {
      if (success) setState(prev => ({ ...prev, createDialogOpen: false }));
    });
  }, [createProject]);

  const handleRenameProject = useCallback((projectId: string, newName: string) => {
    renameProject(projectId, newName).then((success: boolean) => {
      if (success) setState(prev => ({ ...prev, renameDialogOpen: false, selectedProject: null }));
    });
  }, [renameProject]);

  const handleDeleteProject = useCallback((projectId: string) => {
    deleteProject(projectId).then((success: boolean) => {
      if (success) setState(prev => ({ ...prev, deleteDialogOpen: false, selectedProject: null }));
    });
  }, [deleteProject]);

  const handleSelectProject = useCallback((project: Project) => {
    setProject(project);
    navigate(`/project/${project.id}`);
  }, [setProject, navigate]);

  const handleOpenCreateDialog = useCallback(() => {
    setState(prev => ({ ...prev, createDialogOpen: true }));
  }, []);

  const handleOpenRenameDialog = useCallback((project: Project) => {
    setState(prev => ({ ...prev, selectedProject: project, renameDialogOpen: true }));
  }, []);

  const handleOpenDeleteDialog = useCallback((project: Project) => {
    setState(prev => ({ ...prev, selectedProject: project, deleteDialogOpen: true }));
  }, []);

  const handleSearchUpdate = useCallback((value: string) => {
    setState(prev => ({ ...prev, searchTerm: value }));
  }, []);

  // Content rendering functions
  const renderContent = () => {
    if (!hasFetched) {
      return <ProjectsGridSkeleton />;
    }
    
    if (filteredProjects.length > 0) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project: Project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onSelect={handleSelectProject}
              onRename={() => handleOpenRenameDialog(project)}
              onDelete={() => handleOpenDeleteDialog(project)}
            />
          ))}
        </div>
      );
    }
    
    if (projects.length > 0) {
      return (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg font-medium">No projects match your search criteria</p>
          <p className="mt-2">Try adjusting your search terms</p>
        </div>
      );
    }
    
    return <EmptyState onCreateClick={handleOpenCreateDialog} />;
  };

  return (
    <Suspense fallback={<div className="p-10"><ProjectsGridSkeleton /></div>}>
      <div className="space-y-6 p-6 md:p-8 lg:p-10 max-w-7xl mx-auto">
        <SearchHeader
          searchTerm={state.searchTerm}
          setSearchTerm={handleSearchUpdate}
          onCreateClick={handleOpenCreateDialog}
        />

        {errors.fetch && (
          <ErrorAlert 
            message={errors.fetch} 
            onRetry={() => fetchProjects(true)} 
          />
        )}

        <div className="mt-6">
          {renderContent()}
        </div>

        <CreateProjectDialog
          open={state.createDialogOpen}
          onOpenChange={(open: boolean) => setState(prev => ({ ...prev, createDialogOpen: open }))}
          onCreate={handleCreateProject}
          isLoading={isLoading}
          error={errors.create}
          onClearError={clearError}
        />

        <RenameProjectDialog
          open={state.renameDialogOpen}
          onOpenChange={(open: boolean) => setState(prev => ({ ...prev, renameDialogOpen: open }))}
          selectedProject={state.selectedProject}
          onRename={handleRenameProject}
          isLoading={isLoading}
          error={errors.rename}
          onClearError={clearError}
        />

        <DeleteProjectDialog
          open={state.deleteDialogOpen}
          onOpenChange={(open: boolean) => setState(prev => ({ ...prev, deleteDialogOpen: open }))}
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