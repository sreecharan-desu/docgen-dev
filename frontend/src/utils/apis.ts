// API Configuration and Utilities
export const BASE_URL = "https://api2.docgen.dev/api/v1";
export const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
  "Content-Type": "application/json"
});

export const apiCall = async (url, options, retries = 3) => {
    if(localStorage.getItem("token") == null || localStorage.getItem("token") == undefined || localStorage.getItem("token") == ""){
      location.href="";
    }
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url, { ...options, headers: getAuthHeaders() });
        if (!response.ok) throw new Error(`HTTP error ${response.status}`);
        return await response.json();
      } catch (error) {
        if (i === retries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
  };

export const apiMethods = {
    listProjects: () => apiCall(`${BASE_URL}/project/list-projects`, { method: "GET" }),
    createProject: (data) => apiCall(`${BASE_URL}/project/create-project`, { method: "POST", body: JSON.stringify(data) }),
    updateProject: (id, data) => apiCall(`${BASE_URL}/project/update-project/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    deleteProject: (id) => apiCall(`${BASE_URL}/project/delete-project/${id}`, { method: "DELETE" }),
    checkGithubAccess: () => apiCall(`${BASE_URL}/github/check-repo-access`, { method: "GET" }),
    listGithubRepos: () => apiCall(`${BASE_URL}/github/repositories`, { method: "GET" }),
    getProject: (id) => apiCall(`${BASE_URL}/project/get-project/${id}`, { method: "GET" }),
    listRepositories: (projectId) => apiCall(`${BASE_URL}/repositories/list-repositories?project_id=${projectId}`, { method: "GET" }),
    importPublicRepo: (data) => apiCall(`${BASE_URL}/github/import-public-repository`, { method: "POST", body: JSON.stringify(data) }),
    importPrivateRepo: (data) => apiCall(`${BASE_URL}/github/import-repository`, { method: "POST", body: JSON.stringify(data) }),
    createRepository: (data) => apiCall(`${BASE_URL}/repositories/create-repository`, { method: "POST", body: JSON.stringify(data) }),
    updateRepository: (id, data) => apiCall(`${BASE_URL}/repositories/update-repository/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    deleteRepository: (id) => apiCall(`${BASE_URL}/repositories/delete-repository/${id}`, { method: "DELETE" }),
    uploadLocalFiles : (id,name,data)=> apiCall(`${BASE_URL}/storage/upload-from-local?project_id=${id}&name=${name}`, { method: "POST" , body : JSON.stringify(data)}),
    getRepository: (repoId) => apiCall(`${BASE_URL}/repositories/get-repository/${repoId}`, { method: "GET" }),
    generateDocs: (repoId, data) => apiCall(`${BASE_URL}/repositories/generate-docs/${repoId}`, {
      method: "POST",
      body: JSON.stringify(data)
    }),
    listRepofiles : (repo_id)=>apiCall(`${BASE_URL}/storage/list-files/${repo_id}`,{
      method : 'GET'
    }) 
  };
  
export const authGithubApi = `${BASE_URL}/github/authorize-app`;
export const cache = new Map();
