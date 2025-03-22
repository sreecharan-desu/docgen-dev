import { Suspense, useEffect, useCallback, Plus } from "./utils/imports";
import { useParams, useNavigate, useAuth, useDebounce } from "./utils/imports";
import { Button, Input, Search, X, ChevronLeft, Alert, AlertDescription, AlertCircle, RefreshCw } from "./utils/imports";
import { useProjectState } from "./utils/state";
import { useApiHandlers } from "./utils/apiHandlers";
import { useRepoHandlers } from "./utils/repoHandlers";
import { RepoCard, ProjectsGridSkeleton, EmptyRepoState } from "./components/components";
import { ImportDialog, RenameDialog, DeleteDialog } from "./components/dialogues";

const ProjectPage = () => {
  const { id: projectId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [state, setState] = useProjectState();
  const [debouncedSearchTerm] = useDebounce(state.searchTerm, 300);

  const validateToken = useCallback(() => {
    const token = localStorage.getItem("token");
    if (!token || !user) {
      navigate("/");
      return false;
    }
    return true;
  }, [user, navigate]);

  const { checkGithubAccess, fetchGithubRepos, fetchProjectData, handleAuthorizeGithub } = useApiHandlers(state, setState, projectId, navigate, validateToken);
  const { handleImportRepo, handleCreateRepo, handleRenameRepo, handleDeleteRepo } = useRepoHandlers(state, setState, projectId, navigate, validateToken);

  const [debouncedHandleDeleteRepo] = useDebounce(handleDeleteRepo, 1000);
  const [debouncedHandleRenameRepo] = useDebounce(handleRenameRepo, 1000);
  const [debouncedHandleCreateRepo] = useDebounce(handleCreateRepo, 1000);
  const [debouncedHandleImportRepo] = useDebounce(handleImportRepo, 1000);

  const handleFolderSelect = useCallback((e) => {
    const files = e.target.files;
    console.log("Selected files:", files);
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

  const filteredRepos = state.repositories.filter(repo =>
    repo.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
    (repo.repo_url && repo.repo_url.toLowerCase().includes(debouncedSearchTerm.toLowerCase()))
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
            <Button onClick={() => setState(prev => ({ ...prev, open: true }))}>
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
              <RepoCard key={repo.id} repo={repo} navigate={navigate} setState={setState} state={state} />
            ))}
          </div>
        ) : state.repositories.length > 0 ? (
          <div className="text-center py-8 text-muted-foreground">No repositories match your search criteria</div>
        ) : (
          <EmptyRepoState setOpen={() => setState(prev => ({ ...prev, open: true }))} />
        )}

        <ImportDialog
          state={state}
          setState={setState}
          handleAuthorizeGithub={handleAuthorizeGithub}
          debouncedHandleImportRepo={debouncedHandleImportRepo}
          debouncedHandleCreateRepo={debouncedHandleCreateRepo}
          handleFolderSelect={handleFolderSelect}
        />
        <RenameDialog state={state} setState={setState} debouncedHandleRenameRepo={debouncedHandleRenameRepo} />
        <DeleteDialog state={state} setState={setState} debouncedHandleDeleteRepo={debouncedHandleDeleteRepo} />
      </div>
    </Suspense>
  );
};

export default ProjectPage;