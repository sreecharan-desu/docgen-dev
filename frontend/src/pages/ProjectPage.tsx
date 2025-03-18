import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft, PlusCircle, Users, FileText, X, Plus, File, Clock, ChevronRight, Download, Search } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Sidebar from "@/components/dashboard/Sidebar";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { v4 as uuidv4 } from "uuid";
// Custom Components
import ImportRepoModal from "../components/ImportRepoModal";
import EmptyState from "../components/EmptyState";
import MdPreview from "../components/MdPreview";
import { LoadingAnimation } from "@/AppRoutes";
import { Folder, GitBranch, FileCheck } from "lucide-react"; // Add Folder icon
import { ScrollArea } from "@/components/ui/scroll-area"; // Ensure ScrollArea is imported
import { Copy } from "lucide-react"; // Add Copy icon
import ReactMarkdown from "react-markdown"; // For markdown rendering


const GET_PROJECT_API = async (projectId, token) => {
  try {
    const response = await fetch(`https://api2.docgen.dev/api/v1/project/get-project/${projectId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch project data');
    }

    const data = await response.json();
    return {
      name: data.name,
      id: data.id,
      collaborators: data.collaborator_count
    };
  } catch (error) {
    console.error("Project fetch error:", error);
    throw new Error(`API Error: ${error.message}`);
  }
};

const GET_REPOS_API = async (projectId, userId, token) => {
  try {
    // In a real implementation, this would make an API call instead of using localStorage
    const storedRepos = localStorage.getItem(`repos_${projectId}_${userId}`);
    return storedRepos ? JSON.parse(storedRepos) : [];
  } catch (error) {
    console.error("Error retrieving repositories:", error);
    return [];
  }
};

const IMPORT_REPO_API = async (projectId, userId, repoData, token) => {
  try {
    const storedFilesKey = `files_${projectId}_${repoData.url}`;
    const storedFiles = localStorage.getItem(storedFilesKey);
    let files = repoData.files || (storedFiles ? JSON.parse(storedFiles) : ["README.md"]);

    if (!Array.isArray(files)) {
      console.warn("Invalid file data, using fallback");
      files = ["README.md"];
    }

    localStorage.setItem(storedFilesKey, JSON.stringify(files));

    const newRepo = {
      id: uuidv4(),
      name: repoData.name,
      url: repoData.url,
      type: repoData.type,
      source: repoData.source,
      files,
      userId,
      projectId,
      documentationHistory: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return newRepo;
  } catch (error) {
    console.error("Error importing repository:", error);
    throw new Error(`Import Error: ${error.message}`);
  }
};

const GENERATE_DOCS_API = async (repo, token) => {
  try {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Mock documentation generation
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
  } catch (error) {
    console.error("Error generating documentation:", error);
    throw new Error(`Generation Error: ${error.message}`);
  }
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
  const [collaborators, setCollaborators] = useState(0);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState("repositories");
  const [permission, setPermission] = useState("read");
  const [searchTerm, setSearchTerm] = useState("");
  const [repoFilter, setRepoFilter] = useState("all");

  const JWT_TOKEN = localStorage.getItem("token") || "mock-token";

  // Fetch project and repositories data
  useEffect(() => {

    if (localStorage.getItem("token") == undefined || localStorage.getItem("token") == null) {
      navigate('/')
    }
    const fetchData = async () => {
      if (localStorage.getItem("token") == undefined || localStorage.getItem("token") == null) {
        navigate('/')
      }
      try {
        const projectData = await GET_PROJECT_API(projectId, JWT_TOKEN);
        const repoData = await GET_REPOS_API(projectId, user?.id, JWT_TOKEN);
        setProject(projectData);
        setRepositories(repoData);
        setCollaborators(projectData.collaborators || 0);
      } catch (error) {
        toast.error("Failed to load project data");
        console.error(error);
      }
    };

    if (projectId && user?.id) {
      fetchData();
    }
  }, [projectId, user?.id, JWT_TOKEN]);

  // Filter repositories based on search term and filter selection
  const filteredRepositories = repositories.filter(repo => {
    const matchesSearch = repo.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = repoFilter === "all" ? true : repo.source === repoFilter;
    return matchesSearch && matchesFilter;
  });

  const handleImportSubmit = async (url, type, source, files) => {
    try {
      const name = url.split("/").pop().replace(/\.git$/, "") || "New Repository";
      const repoData = { name, url, type, source, files };

      const newRepo = await IMPORT_REPO_API(projectId, user?.id, repoData, JWT_TOKEN);
      const updatedRepos = [...repositories, newRepo];
      setRepositories(updatedRepos);

      localStorage.setItem(`repos_${projectId}_${user?.id}`, JSON.stringify(updatedRepos));
      localStorage.removeItem(`repos_${projectId}`);
      toast.success("Repository imported successfully");
      setIsImportModalOpen(false);
    } catch (error) {
      toast.error("Failed to import repository");
      console.error("Import error:", error);
    }
  };

  const handleRepoClick = (repo) => {
    setSelectedRepo(repo);
    setIsRepoPreviewOpen(true);
  };

  const renderFileExplorer = (files) => {
    return (
      <div className="w-72 flex-shrink-0 bg-[rgb(13_17_23_/_0.3)] border-r border-gray-600">
        <div className="p-4 border-b border-gray-600">
          <h3 className="text-sm font-semibold text-gray-200">Files</h3>
        </div>
        <ScrollArea className="h-[calc(60vh-112px)]">
          <div className="p-4">
            {files.length > 0 ? (
              files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 py-2 text-sm text-gray-300 hover:bg-gray-700/50 rounded-md transition-colors duration-200"
                >
                  <FileText className="h-4 w-4 text-teal-400" />
                  <span className="truncate">{file}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-400 italic">No files available</p>
            )}
          </div>
        </ScrollArea>
      </div>
    );
  };
  const generateDocumentation = async () => {
    if (!selectedRepo) return;

    setIsGeneratingDocs(true);
    setProgress(0);

    const steps = [
      "Reading files...",
      "Cleaning data...",
      "Extracting insights...",
      "Generating documentation...",
    ];

    // Simulate progress steps
    for (let i = 0; i < steps.length; i++) {
      toast.info(steps[i]);
      setProgress(((i + 1) / steps.length) * 100);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    try {
      const docs = await GENERATE_DOCS_API(selectedRepo, JWT_TOKEN);
      const timestamp = new Date().toISOString();

      // Add new documentation to history
      const updatedHistory = [...(selectedRepo.documentationHistory || []), { content: docs, timestamp }];

      // Update the repository with new documentation
      const updatedRepos = repositories.map((repo) =>
        repo.id === selectedRepo.id
          ? {
            ...repo,
            documentation: docs,
            documentationHistory: updatedHistory,
            updatedAt: timestamp
          }
          : repo
      );

      setRepositories(updatedRepos);
      setDocumentation({ content: docs, repoId: selectedRepo.id });

      // Update selected repo reference to include new documentation
      setSelectedRepo(updatedRepos.find(repo => repo.id === selectedRepo.id));

      // Update localStorage
      localStorage.setItem(`repos_${projectId}_${user?.id}`, JSON.stringify(updatedRepos));
      toast.success("Documentation generated successfully");
    } catch (error) {
      toast.error("Failed to generate documentation");
      console.error("Documentation generation error:", error);
    } finally {
      setIsGeneratingDocs(false);
      setProgress(0);
    }
  };

  const handleInviteCollaborator = (email) => {
    if (!email || !email.includes('@')) {
      toast.error("Please enter a valid email address");
      return;
    }

    toast.success(`Invitation sent to ${email} with ${permission} access`);
    setCollaborators((prev) => prev + 1);
    setIsInviteModalOpen(false);
    setPermission("read");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  // Loading state
  if (!project) {

    return (
      <div className="flex h-screen items-center justify-center rgb(13 17 23 / 0.3) text-gray-200">
        <LoadingAnimation />
      </div>
    );
  }

  const DocumentationPreview = ({ content, repoName, onClose, onDownload }) => {
    const [activeTab, setActiveTab] = useState("preview"); // Toggle between Preview and Raw

    const handleCopy = () => {
      navigator.clipboard.writeText(content);
      toast.success("Copied to clipboard!");
    };

    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl bg-[#0d1117] text-[#c9d1d9] border  rounded-lg p-0">
          <div className="flex flex-col h-[80vh] w-full bg-[#0d1117] rounded-lg overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-3 bg-[#161b22] border-b border-[#30363d]">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#f85149]" />
                <div className="w-3 h-3 rounded-full bg-[#f0883e]" />
                <div className="w-3 h-3 rounded-full bg-[#2ea043]" />
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-center font-medium text-[#c9d1d9]">
                  Documentation - {repoName || "Unnamed"}
                </span>
                <div className="flex gap-1 bg-[#21262d] rounded-md p-1 mr-10">
                  <button
                    onClick={() => setActiveTab("preview")}
                    className={`px-3 py-1 text-sm rounded-md ${activeTab === "preview"
                      ? "bg-[#30363d] text-[#c9d1d9]"
                      : "text-[#8b949e] hover:bg-[#30363d] hover:text-[#c9d1d9]"
                      }`}
                  >
                    Preview
                  </button>
                  <button
                    onClick={() => setActiveTab("raw")}
                    className={`px-3 py-1 text-sm rounded-md ${activeTab === "raw"
                      ? "bg-[#30363d] text-[#c9d1d9]"
                      : "text-[#8b949e] hover:bg-[#30363d] hover:text-[#c9d1d9]"
                      }`}
                  >
                    Raw
                  </button>
                </div>
              </div>

            </div>

            {/* Scrollable Content */}
            <ScrollArea className="flex-1 p-6 bg-[#0d1117] text-[#c9d1d9]">
              {activeTab === "preview" ? (
                <div className="prose prose-invert max-w-none">
                  <ReactMarkdown>{content}</ReactMarkdown>
                </div>
              ) : (
                <pre className="text-sm text-[#c9d1d9] bg-[#161b22] p-4 rounded-md border border-[#30363d] whitespace-pre-wrap">
                  {content}
                </pre>
              )}
            </ScrollArea>

            {/* Footer with Actions */}
            <div className="p-4 border-t border-[#30363d] bg-[#161b22] flex justify-end gap-2">
              <Button
                onClick={handleCopy}
                variant="outline"
                className="bg-[#21262d] text-[#c9d1d9] border-[#30363d] hover:bg-[#30363d] hover:text-[#e6edf3] flex items-center gap-2"
              >
                <Copy className="h-4 w-4" />
                Copy
              </Button>
              <Button
                onClick={onDownload}
                className="bg-[#238636] hover:bg-[#2ea043] text-white font-medium py-2 px-4 rounded-md flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  // Render content based on active section
  const renderContent = () => {
    switch (activeSection) {
      case "pricing":
        navigate('/dashboard'); break;
      case "projects":
        navigate('/dashboard'); break;
      case "settings":
        navigate('/dashboard'); break;
      case "docs":
        navigate("/docs");
        return null;
    }
  };

  return (
    <div className="flex h-screen rgb(13 17 23 / 0.3) text-gray-200 overflow-hidden mt-5">
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="border-b border-gray-700 p-4 flex items-center justify-between rgb(13 17 23 / 0.3)">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/dashboard")}
              className="text-gray-400 hover:text-white hover:bg-gray-600 rounded-full p-2"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-lg font-medium text-white">{project.name || "repositories"}</h1>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsInviteModalOpen(true)}
            className="text-muted-foreground hover:text-foreground border-border flex items-center gap-2"
          >
            <Users className="h-4 w-4" />
            <span>{collaborators} Collaborators</span>
            <Plus className="h-3 w-3 ml-1" />
          </Button>
        </header>

        {/* Main Content */}
        <main className="p-6 flex-1 overflow-y-auto rgb(13 17 23 / 0.3)">
          <div className="flex justify-between items-center mb-6 gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-10 w-full"
                />

                {searchTerm && (
                  <X
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground cursor-pointer"
                    onClick={() => setSearchTerm("")}
                  />
                )}
              </div>
            </div>

            {/* Create Repo Button */}
            <Button
              onClick={() => setIsImportModalOpen(true)}
              className="bg-teal-500 hover:bg-teal-600 text-white font-medium py-2 px-4 rounded-md flex items-center gap-2 transition-all duration-200"
            >
              <PlusCircle className="h-4 w-4" />
              Create Repo
            </Button>
          </div>




          {/* Repository Grid */}
          {filteredRepositories.length === 0 ? (
            <div className="text-center text-gray-400">
              {searchTerm || repoFilter !== "all" ? (
                <div className="py-10">
                  <p className="text-lg">No matching repositories found.</p>
                  <Button
                    variant="link"
                    className="text-teal-500 mt-2"
                    onClick={() => {
                      setSearchTerm("");
                      setRepoFilter("all");
                    }}
                  >
                    Clear filters
                  </Button>
                </div>
              ) : (
                <EmptyState onImportRepo={() => setIsImportModalOpen(true)} />
              )}
            </div>
          ) : (
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRepositories.map((repo) => (
                  <div
                    key={repo.id}
                    onClick={() => handleRepoClick(repo)}
                    className="bg-gradient-to-br rgb(13 14 22 / var(--tw-bg-opacity)) rounded-xl p-5 cursor-pointer 
            hover:shadow-lg hover:-translate-y-1 transform transition-all duration-300 group shadow-md"
                  >
                    {/* Header */}
                    <div className="flex justify-between items-center mb-4">
                      <h3
                        className="text-lg font-semibold text-white truncate group-hover:text-[#a3bffa] transition-colors"
                        title={repo.name}
                      >
                        {repo.name}
                      </h3>
                      <ChevronRight className="h-5 w-5 text-[#8b949e] group-hover:text-[#a3bffa] transition-colors" />
                    </div>

                    {/* Metadata */}
                    <div className="flex flex-col gap-2 text-sm text-[#c9d1d9]">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-[#58a6ff]" />
                          <span className="font-medium">{formatDate(repo.updatedAt)}</span>
                        </span>
                        <span className="px-2 py-1 bg-[#2a2e4a] text-[#79c0ff] text-xs rounded-full">
                          {repo.source || "Local"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center">
                          <File className="h-4 w-4 mr-2 text-[#58a6ff]" />
                          <span>{repo.files?.length || 0} Files</span>
                        </span>
                        <span className="flex items-center">
                          <FileText className="h-4 w-4 mr-2 text-[#58a6ff]" />
                          <span>{repo.documentationHistory?.length || 0} Docs</span>
                        </span>
                      </div>
                    </div>

                    {/* Subtle Footer */}
                    <div className="mt-4 pt-3 border-t border-[#3b3f5c]/50 flex justify-end">
                      <span className="text-xs text-[#8b949e] italic">
                        Last updated: {formatDate(repo.updatedAt)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Repository Preview Popup */}
      <Dialog
        open={isRepoPreviewOpen}
        onOpenChange={(open) => {
          setIsRepoPreviewOpen(open);
          if (!open) setSelectedRepo(null);
        }}
      >
        <DialogContent className="max-w-4xl bg-[#2A3A3A] text-gray-200 border border-gray-600 rounded-lg p-0">
          {selectedRepo && (
            <div className="flex h-[60vh] w-full bg-[#1A2525] rounded-lg overflow-hidden border border-gray-600">
              {/* Enhanced File Explorer Sidebar */}
              {renderFileExplorer(selectedRepo.files || [])}

              {/* Main Content Area */}
              <div className="flex-1 flex flex-col">
                {/* Title Bar */}
                <div className="flex items-center justify-between p-2 bg-[#2A3A3A] border-b border-gray-600">
                  <span className="text-sm font-medium text-gray-200">
                    {selectedRepo.name} - Preview
                  </span>
                </div>

                {/* Main Content */}
                <ScrollArea className="flex-1 p-6 bg-[#1A2525] text-gray-200">
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-lg font-semibold text-white mb-4">
                        Repository: {selectedRepo.name}
                      </h2>
                      <p className="text-sm text-gray-400">
                        {selectedRepo.files?.length || 0} files in this repository
                      </p>
                    </div>

                    {selectedRepo.documentationHistory?.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-white mb-3">Documentation Versions</h3>
                        {selectedRepo.documentationHistory.map((doc, index, arr) => {
                          const version = `V_${Math.floor(arr.length - index)}.${index + 1}.0`; // Simple versioning
                          return (
                            <div
                              key={index}
                              className="p-3 bg-[rgb(13_17_23_/_0.3)] rounded-md border border-gray-600 mb-2 cursor-pointer hover:bg-gray-600 transition-colors duration-200"
                              onClick={() => setDocumentation({ content: doc.content, repoId: selectedRepo.id })}
                            >
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-teal-400" />
                                <span className="text-sm font-medium text-gray-200">{version}</span>
                                <span className="text-xs text-gray-400">
                                  {new Date(doc.timestamp).toLocaleString()}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </ScrollArea>

                {/* Status Bar */}
                <div className="h-6 border-t border-gray-600 bg-[#1A2525] flex items-center px-3 justify-between">
                  <div className="flex items-center text-xs text-gray-400">
                    <GitBranch className="h-3.5 w-3.5 mr-1" />
                    main
                  </div>
                  <div className="flex items-center text-xs text-gray-400">
                    <FileCheck className="h-3.5 w-3.5 mr-1" />
                    {selectedRepo.files?.length || 0} files
                  </div>
                </div>

                {/* Action Bar */}
                <div className="p-4 border-t border-gray-600 bg-[#1A2525]">
                  {isGeneratingDocs ? (
                    <div className="space-y-2">
                      <div
                        style={{ width: `${progress}%` }}
                        className="h-2 bg-teal-500 rounded-full transition-all duration-1000"
                      />
                      <p className="text-sm text-gray-400 text-center">Generating...</p>
                    </div>
                  ) : (
                    <Button
                      onClick={generateDocumentation}
                      className="w-full bg-teal-500 hover:bg-teal-600 text-white font-medium py-2 px-4 rounded-md flex items-center justify-center gap-2"
                    >
                      <FileText className="h-4 w-4" />
                      {selectedRepo.documentation ? "Regenerate Docs" : "Generate Docs"}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Invite Collaborator Modal */}
      <Dialog open={isInviteModalOpen} onOpenChange={setIsInviteModalOpen}>
        <DialogContent className="rgb(13 17 23 / 0.3) text-gray-200 border border-gray-600 rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-medium text-white">Invite a Collaborator</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleInviteCollaborator(e.target.email.value);
            }}
          >
            <div className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-gray-200 font-medium">Email</Label>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="Enter email"
                  className="w-full p-2 mt-1 rgb(13 17 23 / 0.3) border border-gray-600 rounded-md text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>
              <div>
                <Label htmlFor="permission" className="text-gray-200 font-medium">Permission</Label>
                <Select value={permission} onValueChange={setPermission}>
                  <SelectTrigger id="permission" className="w-full mt-1 rgb(13 17 23 / 0.3) border-gray-600 text-gray-200">
                    <SelectValue placeholder="Select permission" />
                  </SelectTrigger>
                  <SelectContent className="rgb(13 17 23 / 0.3) text-gray-200 border-gray-600">
                    <SelectItem value="read">Read</SelectItem>
                    <SelectItem value="edit">Edit</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button type="submit" className="w-full mt-4 bg-teal-500 hover:bg-teal-600 text-white font-medium py-2 px-4 rounded-md">
              Send Invite
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Import Repository Modal */}
      <ImportRepoModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImportSubmit}
        projectId={projectId}
      />
      {/* Documentation Preview */}
      {documentation && (
        <DocumentationPreview
          content={documentation.content}
          repoName={selectedRepo?.name}
          onClose={() => setDocumentation(null)}
          onDownload={() => {
            const blob = new Blob([documentation.content], { type: "text/markdown" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${selectedRepo?.name || "document"}_docs.md`;
            a.click();
            URL.revokeObjectURL(url);
          }}
        />
      )}
    </div>
  );
};

export default ProjectRepositories;