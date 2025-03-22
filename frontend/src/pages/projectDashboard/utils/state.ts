import { useState } from "./imports";

export const useProjectState = () => {
  const [state, setState] = useState({
    open: false,
    renameOpen: false,
    deleteOpen: false,
    repoName: "",
    repoUrl: "",
    newRepoName: "",
    isLoading: false,
    uploadProgress: 0,
    errors: {},
    project: null,
    repositories: [],
    hasFetched: false,
    selectedRepo: null,
    searchTerm: "",
    activeTab: "github",
    githubRepos: [],
    localFolderName: "",
    localFiles: null,
    hasGithubAccess: false,
    installationId: null,
    showRepoList: false,
  });

  return [state, setState];
};