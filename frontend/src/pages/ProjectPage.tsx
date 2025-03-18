import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft, PlusCircle, Users, FileText, X, Plus, File, Clock, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Sidebar from "@/components/dashboard/Sidebar";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Custom Components
import ImportRepoModal from "../components/ImportRepoModal";
import EmptyState from "../components/EmptyState";
import MdPreview from "../components/MdPreview";

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
    // In a real implementation, this would make an API call to import the repo
    const newRepo = {
      id: Date.now(),
      ...repoData,
      files: ["index.js", "styles.css", "utils.js"],
      userId,
      projectId,
      documentationHistory: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
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
    const fetchData = async () => {
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

  const handleImportSubmit = async (url, type, source) => {
    try {
      // Extract repo name from URL
      const name = url.split("/").pop().replace(/\.git$/, "") || "New Repository";
      const repoData = { name, url, type, source };

      const newRepo = await IMPORT_REPO_API(projectId, user?.id, repoData, JWT_TOKEN);
      const updatedRepos = [...repositories, newRepo];
      setRepositories(updatedRepos);

      // Update localStorage
      localStorage.setItem(`repos_${projectId}_${user?.id}`, JSON.stringify(updatedRepos));
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
        <div className="text-lg font-semibold">Loading project...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen rgb(13 17 23 / 0.3) text-gray-200 overflow-hidden">
      {/* Sidebar */}
      <div className={`h-full rgb(13 17 23 / 0.3) ${isSidebarCollapsed ? 'w-20' : 'w-64'} transition-all duration-300`}>
        <Sidebar
          isSidebarCollapsed={isSidebarCollapsed}
          setIsSidebarCollapsed={setIsSidebarCollapsed}
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          user={user ? { ...user, avatarUrl: user.avatarUrl || "" } : null}
          logout={logout}
        />
      </div>

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
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-medium text-white">Manage your <b className="bg-gray-900 rounded-md px-3">{project.name}</b> repositories</h2>
            <Button
              onClick={() => setIsImportModalOpen(true)}
              className="bg-teal-500 hover:bg-teal-600 text-white font-medium py-2 px-4 rounded-md flex items-center"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Repo
            </Button>
          </div>

          <div className="flex justify-between items-center mb-6">
            <Input
              type="text"
              placeholder="Search repositories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-1/3 p-2 bg-[#2A3A3A] border border-gray-600 rounded-md text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <Select value={repoFilter} onValueChange={setRepoFilter}>
              <SelectTrigger className="w-40 bg-[#2A3A3A] border-gray-600 text-gray-200">
                <SelectValue placeholder="All repositories" />
              </SelectTrigger>
              <SelectContent className="bg-[#2A3A3A] text-gray-200 border-gray-600">
                <SelectItem value="all">All repositories</SelectItem>
                <SelectItem value="personal">Personal</SelectItem>
                <SelectItem value="shared">Shared</SelectItem>
              </SelectContent>
            </Select>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRepositories.map((repo) => (
                <div
                  key={repo.id}
                  onClick={() => handleRepoClick(repo)}
                  className="bg-card border border-border rounded-lg p-4 cursor-pointer hover:bg-accent/50 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="text-base font-medium truncate">{repo.name}</h3>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>

                  <div className="mt-3 flex items-center text-xs text-muted-foreground space-x-4">
                    <span className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatDate(repo.updatedAt)}
                    </span>
                    <span className="flex items-center">
                      <File className="h-3 w-3 mr-1" />
                      {repo.files?.length || 0}
                    </span>
                    <span className="flex items-center">
                      <FileText className="h-3 w-3 mr-1" />
                      {repo.documentationHistory?.length || 0}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Repository Preview Popup */}
      <Dialog open={isRepoPreviewOpen} onOpenChange={(open) => {
        setIsRepoPreviewOpen(open);
        if (!open) setSelectedRepo(null);
      }}>
        <DialogContent className="max-w-4xl bg-[#2A3A3A] text-gray-200 border border-gray-600 rounded-lg p-0">
          {selectedRepo && (
            <div className="flex flex-col h-[60vh]">
              <div className="flex items-center justify-between p-2 rgb(13 17 23 / 0.3) border-b border-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <span className="text-sm font-medium text-gray-200">
                  Preview of {selectedRepo.name}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsRepoPreviewOpen(false)}
                  className="text-gray-400 hover:text-white hover:bg-gray-600 rounded-full p-2"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex-1 p-4 overflow-y-auto">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-200 mb-2">Files</h3>
                  {selectedRepo.files && selectedRepo.files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-2 rgb(13 17 23 / 0.3) rounded-md border border-gray-600"
                    >
                      <FileText className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-300">{file}</span>
                    </div>
                  ))}
                </div>
                {selectedRepo.documentationHistory && selectedRepo.documentationHistory.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-sm font-medium text-gray-200 mb-2">Documentation History</h3>
                    {selectedRepo.documentationHistory.map((doc, index) => (
                      <div
                        key={index}
                        className="p-2 rgb(13 17 23 / 0.3) rounded-md border border-gray-600 mb-2 cursor-pointer hover:bg-gray-600 transition-colors duration-200"
                        onClick={() => setDocumentation({ content: doc.content, repoId: selectedRepo.id })}
                      >
                        <p className="text-xs text-gray-400">
                          Generated on: {new Date(doc.timestamp).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="p-4 border-t border-gray-600">
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
                    className="w-full bg-teal-500 hover:bg-teal-600 text-white font-medium py-2 px-4 rounded-md"
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    {selectedRepo.documentation ? "Regenerate Documentation" : "Generate Documentation"}
                  </Button>
                )}
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
        <MdPreview
          isOpen={!!documentation}
          onClose={() => setDocumentation(null)}
          content={documentation.content}
          onDownload={() => {
            const blob = new Blob([documentation.content], { type: "text/markdown" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${selectedRepo?.name || "document"}_docs.md`;
            a.click();
            URL.revokeObjectURL(url); // Clean up to avoid memory leaks
          }}
        />
      )}
    </div>
  );
};

export default ProjectRepositories;