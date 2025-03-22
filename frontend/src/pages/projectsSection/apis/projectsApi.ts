import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { projectAtom, projectsAtom } from "@/store/store";
import { useSetRecoilState, useRecoilState } from "recoil";
import { useAuth } from "@/contexts/AuthContext";
import { useDebounce } from "use-debounce";
import { apiMethods, cache } from "@/utils/apis";
import { deepEqual } from "@/utils/functions";

export const useProjectsApi = () => {
  const [projects, setProjects] = useRecoilState(projectsAtom);
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

  const fetchProjects = useCallback(async (force = false) => {
    if (!validateToken()) return;
    const cacheKey = "projects";
    if (!force && cache.has(cacheKey)) {
      const cached = cache.get(cacheKey);
      setProjects(cached);
      setState(prev => ({ ...prev, isLoading: false, hasFetched: true }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const newData = await apiMethods.listProjects();
      cache.set(cacheKey, newData);
      setProjects(prev => {
        if (force || !deepEqual(prev, newData)) return newData;
        return prev;
      });
      setState(prev => ({ ...prev, isLoading: false, hasFetched: true }));
    } catch (error) {
      setState(prev => ({ ...prev, errors: { fetch: error.message || "Failed to fetch projects" }, isLoading: false, hasFetched: true }));
    }
  }, [setProjects, validateToken]);

  const [debouncedCreateProject] = useDebounce(async (name, description) => {
    if (!validateToken() || !name.trim() || !description.trim()) {
      setState(prev => ({ ...prev, errors: { create: "Invalid input or no token" }, isLoading: false }));
      return;
    }
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const projectData = { name, description, owner_id: user?.id };
      const newProject = await apiMethods.createProject(projectData);
      setProjects(prev => [...prev, newProject]);
      setProject(newProject);
      navigate(`/project/${newProject.id}`);
      setState(prev => ({ ...prev, isLoading: false }));
    } catch (error) {
      setState(prev => ({ ...prev, errors: { create: error.message || "Failed to create project" }, isLoading: false }));
    }
  }, 1000);

  const [debouncedRenameProject] = useDebounce(async (projectId, newName) => {
    if (!validateToken() || !newName.trim()) {
      setState(prev => ({ ...prev, errors: { rename: "Invalid input or no token" }, isLoading: false }));
      return;
    }
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const updatedProject = await apiMethods.updateProject(projectId, { name: newName });
      setProjects(prev => prev.map(p => p.id === projectId ? updatedProject : p));
      setState(prev => ({ ...prev, isLoading: false }));
    } catch (error) {
      setState(prev => ({ ...prev, errors: { rename: error.message || "Failed to rename project" }, isLoading: false }));
    }
  }, 1000);

  const [debouncedDeleteProject] = useDebounce(async (projectId) => {
    if (!validateToken()) return;
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      await apiMethods.deleteProject(projectId);
      setProjects(prev => prev.filter(p => p.id !== projectId));
      setState(prev => ({ ...prev, isLoading: false }));
    } catch (error) {
      setState(prev => ({ ...prev, errors: { delete: error.message || "Failed to delete project" }, isLoading: false }));
    }
  }, 1000);

  const clearError = useCallback((key) => {
    setState(prev => {
      const newErrors = { ...prev.errors };
      delete newErrors[key];
      return { ...prev, errors: newErrors };
    });
  }, []);

  return { projects, ...state, fetchProjects, createProject: debouncedCreateProject, renameProject: debouncedRenameProject, deleteProject: debouncedDeleteProject, clearError, setProject };
};
