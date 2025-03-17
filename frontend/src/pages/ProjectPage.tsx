import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft, PlusCircle, Users, FileText, Loader2, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "@/components/dashboard/Sidebar";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Custom Components
import ImportRepoModal from "../components/ImportRepoModal";
import EmptyState from "../components/EmptyState";
import MdPreview from "../components/MdPreview";
import { Label } from "recharts";
import { Input } from "@/components/ui/input";

// API Placeholders (Mocked for now, replace with real API calls)
const GET_PROJECT_API = async (projectId, token) => {
  return { name: `Project ${projectId}`, id: projectId };
};

const GET_REPOS_API = async (projectId, userId, token) => {
  return JSON.parse(localStorage.getItem(`repos_${projectId}_${userId}`)) || [];
};

const IMPORT_REPO_API = async (projectId, userId, repoData, token) => {
  const newRepo = {
    id: Date.now(),
    ...repoData,
    files: ["index.js", "styles.css", "utils.js"],
    userId,
    projectId,
    documentationHistory: [], // Initialize history
  };
  return newRepo;
};

const GENERATE_DOCS_API = async (repo, token) => {
  await new Promise((resolve) => setTimeout(resolve, 3000)); // Fake delay
  const mockDocs = `
# ${repo.name} Documentation

## Overview
This is a clean, minimalistic documentation for the ${repo.name} repository.

## Files
${repo.files.map((file) => `- **${file}**: Automatically generated description`).join("\n")}

## Usage
\`\`\`javascript
console.log("Hello from ${repo.name}");
\`\`\`

Generated on: ${new Date().toLocaleDateString()}
  `;
  return mockDocs;
};

const ProjectRepositories = () => {
  const { id: projectId } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [project, setProject] = useState(null);
  const [repositories, setRepositories] = useState([]);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isRepoPreviewOpen, setIsRepoPreviewOpen] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [isGeneratingDocs, setIsGeneratingDocs] = useState(false);
  const [documentation, setDocumentation] = useState(null);
  const [progress, setProgress] = useState(0);
  const [collaborators, setCollaborators] = useState(3);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [permission, setPermission] = useState("read");

  const JWT_TOKEN = localStorage.getItem("token") || "mock-token";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const projectData = await GET_PROJECT_API(projectId, JWT_TOKEN);
        const repoData = await GET_REPOS_API(projectId, user?.id, JWT_TOKEN);
        setProject(projectData);
        setRepositories(repoData);
      } catch (error) {
        toast.error("Failed to load project data");
      }
    };
    fetchData();
  }, [projectId, user]);

  const handleImportSubmit = async (url, type, source) => {
    try {
      const repoData = { name: url.split("/").pop(), url, type, source };
      const newRepo = await IMPORT_REPO_API(projectId, user?.id, repoData, JWT_TOKEN);
      const updatedRepos = [...repositories, newRepo];
      setRepositories(updatedRepos);
      localStorage.setItem(`repos_${projectId}_${user?.id}`, JSON.stringify(updatedRepos));
      toast.success("Repository imported successfully");
      setIsImportModalOpen(false);
    } catch (error) {
      toast.error("Failed to import repository");
    }
  };

  const handleRepoClick = (repo) => {
    setSelectedRepo(repo);
    setIsRepoPreviewOpen(true);
  };

  const generateDocumentation = async () => {
    setIsGeneratingDocs(true);
    setProgress(0);
    const steps = [
      "Reading files...",
      "Cleaning data...",
      "Extracting insights...",
      "Generating documentation...",
    ];

    for (let i = 0; i < steps.length; i++) {
      toast.info(steps[i]);
      setProgress(((i + 1) / steps.length) * 100);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    try {
      const docs = await GENERATE_DOCS_API(selectedRepo, JWT_TOKEN);
      const timestamp = new Date().toISOString();
      const updatedHistory = [...(selectedRepo.documentationHistory || []), { content: docs, timestamp }];
      const updatedRepos = repositories.map((repo) =>
        repo.id === selectedRepo.id ? { ...repo, documentation: docs, documentationHistory: updatedHistory } : repo
      );
      setRepositories(updatedRepos);
      setDocumentation({ content: docs, repoId: selectedRepo.id });
      localStorage.setItem(`repos_${projectId}_${user?.id}`, JSON.stringify(updatedRepos));
      toast.success("Documentation generated successfully");
    } catch (error) {
      toast.error("Failed to generate documentation");
    } finally {
      setIsGeneratingDocs(false);
      setProgress(0);
    }
  };

  const handleInviteCollaborator = (email) => {
    toast.success(`Invitation sent to ${email} with ${permission} access`);
    setCollaborators((prev) => prev + 1);
    setIsInviteModalOpen(false);
    setPermission("read"); // Reset to default
  };

  const getUserInitials = () => {
    if (!user?.name) return "U";
    const parts = user.name.trim().split(" ");
    return parts.length > 1 ? `${parts[0][0]}${parts[1][0]}`.toUpperCase() : parts[0].substring(0, 2).toUpperCase();
  };

  if (!project) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-900 text-white">
        <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="text-lg font-semibold">
          Loading project...
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100 overflow-hidden">
      <motion.div
        animate={{ width: isSidebarCollapsed ? 80 : 250 }}
        transition={{ type: "spring", stiffness: 250, damping: 20 }}
        className="h-full bg-gray-950 border-r border-gray-800"
      >
        <Sidebar
          isSidebarCollapsed={isSidebarCollapsed}
          setIsSidebarCollapsed={setIsSidebarCollapsed}
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          user={user ? { ...user, avatarUrl: user.avatarUrl || "" } : null}
          logout={logout}
        />
      </motion.div>

      <div className="flex-1 flex flex-col">
        <motion.header
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="border-b border-gray-800 p-4 flex items-center justify-between bg-gray-850"
        >
          <div className="flex items-center space-x-3">
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")} className="text-gray-400 hover:text-white hover:bg-gray-700">
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </motion.div>
            <h1 className="text-xl font-semibold text-white">{project.name}</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-sm text-gray-400">
              <Users className="h-5 w-5 mr-2 text-blue-500" />
              <span>{collaborators} Collaborators</span>
            </div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                onClick={() => setIsInviteModalOpen(true)}
                className="border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white"
              >
                Invite Collaborator
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button onClick={() => setIsImportModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
                <PlusCircle className="mr-2 h-4 w-4" />
                Import Repository
              </Button>
            </motion.div>
          </div>
        </motion.header>

        <main className="p-6 flex-1 overflow-y-auto bg-gray-900">
          <AnimatePresence mode="wait">
            {repositories.length === 0 ? (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                <EmptyState onImportRepo={() => setIsImportModalOpen(true)} />
              </motion.div>
            ) : (
              <motion.div
                key="repos"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
              >
                {repositories.map((repo, index) => (
                  <motion.div
                    key={repo.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    whileHover={{ scale: 1.02, boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)" }}
                    onClick={() => handleRepoClick(repo)}
                    className="bg-gray-850 border border-gray-800 rounded-md p-4 cursor-pointer hover:bg-gray-800 transition-all"
                  >
                    <h3 className="text-base font-medium text-white truncate">{repo.name}</h3>
                    <p className="text-xs text-gray-400 mt-1">{repo.source}</p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-gray-500">{repo.files.length} files</p>
                      {repo.documentation && (
                        <span className="text-xs text-blue-500">Docs Available</span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* VS Code-style Repository Preview Popup */}
      <Dialog open={isRepoPreviewOpen} onOpenChange={setIsRepoPreviewOpen}>
        <DialogContent className="max-w-4xl bg-gray-900 text-gray-100 border border-gray-800 rounded-lg p-0">
          <div className="flex flex-col h-[60vh]">
            <div className="flex items-center justify-between p-2 bg-gray-850 border-b border-gray-800">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <span className="text-sm font-medium text-gray-100">Preview of {selectedRepo?.name} - VS Code</span>
              <Button variant="ghost" size="sm" onClick={() => setIsRepoPreviewOpen(false)} className="text-gray-400 hover:text-white hover:bg-gray-700">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1 p-4 overflow-y-auto">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-2">
                {selectedRepo?.files.map((file, index) => (
                  <motion.div
                    key={index}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className="flex items-center gap-2 p-2 bg-gray-850 rounded-md border border-gray-800"
                  >
                    <FileText className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-300">{file}</span>
                  </motion.div>
                ))}
              </motion.div>
              {selectedRepo?.documentationHistory?.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-100 mb-2">Documentation History</h3>
                  {selectedRepo.documentationHistory.map((doc, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                      className="p-2 bg-gray-850 rounded-md border border-gray-800 mb-2 cursor-pointer hover:bg-gray-800"
                      onClick={() => setDocumentation({ content: doc.content, repoId: selectedRepo.id })}
                    >
                      <p className="text-xs text-gray-400">Generated on: {new Date(doc.timestamp).toLocaleString()}</p>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
            <div className="p-4 border-t border-gray-800">
              {isGeneratingDocs ? (
                <div className="space-y-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1, ease: "easeInOut" }}
                    className="h-2 bg-blue-500 rounded-full"
                  />
                  <p className="text-sm text-gray-400 text-center">Generating...</p>
                </div>
              ) : (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button onClick={generateDocumentation} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    <FileText className="mr-2 h-4 w-4" />
                    {selectedRepo?.documentation ? "Regenerate Documentation" : "Generate Documentation"}
                  </Button>
                </motion.div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Invite Collaborator Modal with Permissions */}
      <Dialog open={isInviteModalOpen} onOpenChange={setIsInviteModalOpen}>
        <DialogContent className="bg-gray-850 text-gray-100 border border-gray-800 rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-white">Invite a Collaborator</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleInviteCollaborator(e.target.email.value);
              e.target.reset();
            }}
          >
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-gray-100 font-medium">Email</Label>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="Enter email"
                  className="w-full p-2 mt-1 bg-gray-900 border border-gray-700 rounded-md text-gray-100 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <Label htmlFor="permission" className="text-gray-100 font-medium">Permission</Label>
                <Select value={permission} onValueChange={setPermission}>
                  <SelectTrigger className="w-full mt-1 bg-gray-900 border-gray-700 text-gray-100">
                    <SelectValue placeholder="Select permission" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 text-gray-100 border-gray-700">
                    <SelectItem value="read">Read</SelectItem>
                    <SelectItem value="edit">Edit</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="mt-4">
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                Send Invite
              </Button>
            </motion.div>
          </form>
        </DialogContent>
      </Dialog>

      <ImportRepoModal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} onImport={handleImportSubmit} projectId={projectId} />
      {documentation && (
        <MdPreview
          isOpen={!!documentation}
          onClose={() => setDocumentation(null)}
          content={documentation.content}
          onDownload={() => {
            const blob = new Blob([documentation.content], { type: "text/markdown" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${selectedRepo.name}_docs.md`;
            a.click();
          }}
        />
      )}
    </div>
  );
};

export default ProjectRepositories;