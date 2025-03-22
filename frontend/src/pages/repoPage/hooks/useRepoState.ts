import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useDebounce } from "use-debounce";
import { toast } from "sonner";
import { apiMethods } from "@/utils/apis";
import { repoCache } from "../utils/repoCache";

export const useRepoState = (repoId, navigate) => {
  const { user } = useAuth();
  const [state, setState] = useState({
    projectId: "",
    repo: null,
    isLoading: true,
    errors: {},
    isGeneratingDocs: false,
    documentation: null,
    progress: 0,
    currentStep: "",
    hasFetched: false,
    uploadedFiles: [],
    showUploadDialog: false,
    selectedFile: null,
    showInviteDialog: false,
    collaborators: [],
    inviteEmail: "",
    invitePermission: "read",
    inviteError: "",
    expandedFolders: new Set(["root"]),
  });

  const validateToken = useCallback(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return false;
    }
    return true;
  }, [navigate]);

  const fetchRepoData = useCallback(
    async (force = false) => {
      if (!validateToken()) return;

      if (!force && repoCache.has(repoId)) {
        setState((prev) => ({
          ...prev,
          repo: repoCache.get(repoId),
          projectId: repoCache.get(repoId).project_id,
          isLoading: false,
          hasFetched: true,
          showUploadDialog:
            repoCache.get(repoId).source === "local" &&
            (!repoCache.get(repoId).files || repoCache.get(repoId).files.length === 0),
          collaborators: [],
        }));
        return;
      }

      try {
        const newRepoData = await apiMethods.getRepository(repoId);
        repoCache.set(repoId, newRepoData);
        setState((prev) => ({
          ...prev,
          repo: newRepoData,
          projectId: newRepoData.project_id,
          isLoading: false,
          hasFetched: true,
          showUploadDialog:
            newRepoData.source === "local" && (!newRepoData.files || newRepoData.files.length === 0),
          collaborators: [],
        }));
      } catch (err) {
        setState((prev) => ({
          ...prev,
          errors: { fetch: err.message || "Error fetching repository" },
          isLoading: false,
          hasFetched: true,
        }));
      }
    },
    [repoId, validateToken]
  );

  const handleFolderUpload = useCallback((event) => {
    const files = Array.from(event.target.files);
    const fileList = files.map((file) => file.webkitRelativePath || file.name);
    setState((prev) => ({
      ...prev,
      uploadedFiles: fileList,
      repo: { ...prev.repo, files: fileList },
      showUploadDialog: false,
    }));
    toast.success("Folder uploaded successfully");
  }, []);

  const generateDocs = useCallback(async () => {
    if (!state.repo || !validateToken()) return;
    if (state.repo.source === "local" && state.uploadedFiles.length === 0) {
      setState((prev) => ({ ...prev, showUploadDialog: true }));
      return;
    }

    const steps = [
      "Reading files...",
      "Cleaning data...",
      "Extracting insights...",
      "Generating documentation...",
    ];
    setState((prev) => ({ ...prev, isGeneratingDocs: true, progress: 0, currentStep: steps[0] }));

    try {
      for (let i = 0; i < steps.length; i++) {
        setState((prev) => ({ ...prev, currentStep: steps[i], progress: ((i + 1) / steps.length) * 100 }));
        toast.info(steps[i]);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      const docs = await apiMethods.generateDocs(state.repo.id, { repo: state.repo });
      const timestamp = new Date().toISOString();
      const updatedHistory = [
        ...(state.repo.documentationHistory || []),
        { content: docs.content || docs, timestamp },
      ];
      const updatedRepo = {
        ...state.repo,
        documentation: docs.content || docs,
        documentationHistory: updatedHistory,
        updatedAt: timestamp,
      };

      setState((prev) => ({
        ...prev,
        repo: updatedRepo,
        documentation: { content: docs.content || docs, repoId: state.repo.id },
        isGeneratingDocs: false,
        progress: 0,
        currentStep: "",
        errors: { ...prev.errors, generate: undefined },
      }));
      toast.success("Documentation generated successfully");
    } catch (err) {
      setState((prev) => ({
        ...prev,
        errors: { ...prev.errors, generate: err.message || "Failed to generate documentation" },
        isGeneratingDocs: false,
        progress: 0,
        currentStep: "",
      }));
      toast.error(err.message || "Failed to generate documentation");
    }
  }, [state.repo, state.uploadedFiles, validateToken]);

  const inviteCollaborator = useCallback(async () => {
    if (!state.inviteEmail || !validateToken()) {
      toast.error("Please enter an email address or check authentication");
      return;
    }

    try {
      await apiMethods.inviteCollaborator(repoId, {
        email: state.inviteEmail,
        permission: state.invitePermission,
        repoId: repoId,
      });

      setState((prev) => ({
        ...prev,
        collaborators: [
          ...prev.collaborators,
          { email: state.inviteEmail, permission: state.invitePermission },
        ],
        showInviteDialog: false,
        inviteEmail: "",
        invitePermission: "read",
      }));
      toast.success(`Successfully invited ${state.inviteEmail}`);
    } catch (err) {
      toast.error("Failed to invite collaborator: " + err.message);
    }
  }, [state.inviteEmail, state.invitePermission, repoId, validateToken]);

  const [debouncedGenerateDocs] = useDebounce(generateDocs, 1000);
  const [debouncedInviteCollaborator] = useDebounce(inviteCollaborator, 1000);

  useEffect(() => {
    if (!state.hasFetched) {
      fetchRepoData(true);
    }
  }, [fetchRepoData, state.hasFetched]);

  return {
    state,
    setState,
    fetchRepoData,
    handleFolderUpload,
    generateDocs,
    inviteCollaborator,
    debouncedGenerateDocs,
    debouncedInviteCollaborator,
  };
};