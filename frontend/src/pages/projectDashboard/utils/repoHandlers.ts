import { useCallback } from "./imports";
import { cache, apiMethods, toast } from "./imports";

export const useRepoHandlers = (state, setState, projectId, navigate, validateToken) => {
  const TEXT_FILE_EXTENSIONS = [
    '.txt', '.py', '.js', '.ts', '.jsx', '.tsx', '.html', '.css', '.json', '.md', '.java', '.cpp', '.c', '.rb'
  ];

  const processLocalFiles = async (files) => {
    const fileList = [];
    for (const file of files) {
      const fileName = file.name;
      const extension = fileName.slice(fileName.lastIndexOf('.')).toLowerCase();
      
      // Exclude files starting with a dot
      if (fileName.startsWith('.')) {
        continue; // Skip this file
      }

      if (TEXT_FILE_EXTENSIONS.includes(extension)) {
        try {
          const content = await file.text();
          fileList.push({
            path: file.webkitRelativePath,
            content: content
          });
        } catch (error) {
          console.error(`Error reading file ${file.name}:`, error);
        }
      }
    }

    console.log("Processed files:", fileList);

    return fileList;
  };

  const handleImportRepo = useCallback(async (repo) => {
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

  return { handleImportRepo, handleCreateRepo, handleRenameRepo, handleDeleteRepo };
};