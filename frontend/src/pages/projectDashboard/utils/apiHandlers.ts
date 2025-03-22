import { deepEqual, useCallback } from "./imports";
import { cache, apiMethods, toast, BASE_URL } from "./imports";

export const useApiHandlers = (state, setState, projectId, navigate, validateToken) => {
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
      if (!response.has_access) toast.info("Please authorize GitHub access to import repositories");
      else fetchGithubRepos();
    } catch (error) {
      setState(prev => ({ ...prev, errors: { githubAccess: "Failed to check GitHub access: " + error.message } }));
    }
  }, [validateToken]);

  const fetchGithubRepos = useCallback(async (force = false) => {
    if (!validateToken()) return;
    if (!force && cache.githubRepos) {
      setState(prev => ({ ...prev, githubRepos: cache.githubRepos, isLoading: false }));
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
      if (!force && cache.project.has(projectId) && cache.repositories.has(projectId)) {
        projectData = cache.project.get(projectId);
        reposData = cache.repositories.get(projectId);
      } else {
        [projectData, reposData] = await Promise.all([
          apiMethods.getProject(projectId),
          apiMethods.listRepositories(projectId)
        ]);
        cache.project.set(projectId, projectData);
        cache.repositories.set(projectId, reposData);
      }

      const newProject = {
        name: projectData.name,
        id: projectData.id,
        collaborators: projectData.collaborator_count
      };
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
  }, [projectId, validateToken]);

  const handleAuthorizeGithub = useCallback(() => {
    localStorage.setItem("github_redirect_url", location.pathname + location.search);
    window.location.href = `${BASE_URL}/github/authorize-app`;
  }, [location]);

  return { checkGithubAccess, fetchGithubRepos, fetchProjectData, handleAuthorizeGithub };
};