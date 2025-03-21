import { useParams } from "react-router-dom";
import React, { useState, useEffect, useCallback, memo, Suspense } from "react";
import {
  ChevronLeft,
  FileText,
  Clock,
  Download,
  Copy,
  File,
  FileCheck,
  RefreshCw,
  Upload,
  Folder,
  UserPlus,
  Users,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LoadingAnimation } from "@/AppRoutes";

const Button = React.lazy(() => import("@/components/ui/button").then(mod => ({ default: mod.Button })));
const Dialog = React.lazy(() => import("@/components/ui/dialog").then(mod => ({ default: mod.Dialog })));
const DialogContent = React.lazy(() => import("@/components/ui/dialog").then(mod => ({ default: mod.DialogContent })));
const DialogHeader = React.lazy(() => import("@/components/ui/dialog").then(mod => ({ default: mod.DialogHeader })));
const DialogTitle = React.lazy(() => import("@/components/ui/dialog").then(mod => ({ default: mod.DialogTitle })));
const Alert = React.lazy(() => import("@/components/ui/alert").then(mod => ({ default: mod.Alert })));
const AlertDescription = React.lazy(() => import("@/components/ui/alert").then(mod => ({ default: mod.AlertDescription })));
const Input = React.lazy(() => import("@/components/ui/input").then(mod => ({ default: mod.Input })));
const Select = React.lazy(() => import("@/components/ui/select").then(mod => ({ default: mod.Select })));
const SelectTrigger = React.lazy(() => import("@/components/ui/select").then(mod => ({ default: mod.SelectTrigger })));
const SelectValue = React.lazy(() => import("@/components/ui/select").then(mod => ({ default: mod.SelectValue })));
const SelectContent = React.lazy(() => import("@/components/ui/select").then(mod => ({ default: mod.SelectContent })));
const SelectItem = React.lazy(() => import("@/components/ui/select").then(mod => ({ default: mod.SelectItem })));

const BASE_URL = "https://api2.docgen.dev/api/v1";
const JWT_TOKEN = localStorage.getItem("token");

const apiCall = async (url, options, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      return await response.json();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
};

const buildFileTree = (files) => {
  const tree = { name: "root", children: [], isFolder: true };
  files.forEach(file => {
    const parts = file.split('/');
    let current = tree;
    parts.forEach((part, index) => {
      if (index === parts.length - 1) {
        current.children.push({ name: part, isFolder: false });
      } else {
        let folder = current.children.find(child => child.name === part && child.isFolder);
        if (!folder) {
          folder = { name: part, children: [], isFolder: true };
          current.children.push(folder);
        }
        current = folder;
      }
    });
  });
  return tree;
};

const RepoPage = memo(() => {
  const { id: repoId } = useParams();
  const { user } = useAuth(); // Kept for potential future use
  const navigate = useNavigate();
  const [state, setState] = useState({
    projectId: '',
    repo: null,
    isLoading: true,
    errors: {},
    isGeneratingDocs: false,
    documentation: null,
    progress: 0,
    currentStep: '', // New property to track the current step
    hasFetched: false,
    uploadedFiles: [],
    showUploadDialog: false,
    selectedFile: null,
    showInviteDialog: false,
    collaborators: [],
    inviteEmail: '',
    invitePermission: 'read',
    inviteError: '',
    expandedFolders: new Set(['root'])
  });
  const fetchRepoData = useCallback(async (force = false) => {
    if (!JWT_TOKEN) {
      navigate("/");
      return;
    }

    try {
      const newRepoData = await apiCall(`${BASE_URL}/repositories/get-repository/${repoId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${JWT_TOKEN}`,
          "Content-Type": "application/json",
        },
      });

      setState(prev => {
        const updatedState = {
          ...prev,
          repo: newRepoData,
          projectId: newRepoData.project_id,
          isLoading: false,
          hasFetched: true,
          showUploadDialog: newRepoData.source === "local" && (!newRepoData.files || newRepoData.files.length === 0),
          collaborators: [] // Since API is commented out, keeping it empty
        };
        return force || !deepEqual(prev.repo, newRepoData) ? updatedState : prev;
      });
    } catch (err) {
      setState(prev => ({
        ...prev,
        errors: { fetch: err.message || "Error fetching repository" },
        isLoading: false,
        hasFetched: true
      }));
    }
  }, [repoId, navigate]);

  const handleFolderUpload = useCallback((event) => {
    const files = Array.from(event.target.files);
    const fileList = files.map(file => file.webkitRelativePath || file.name);

    setState(prev => ({
      ...prev,
      uploadedFiles: fileList,
      repo: {
        ...prev.repo,
        files: fileList
      },
      showUploadDialog: false
    }));
    toast.success("Folder uploaded successfully");
  }, []);


  const generateDocs = useCallback(async () => {
    if (!state.repo) return;
    if (state.repo.source === "local" && state.uploadedFiles.length === 0) {
      setState(prev => ({ ...prev, showUploadDialog: true }));
      return;
    }

    const steps = ["Reading files...", "Cleaning data...", "Extracting insights...", "Generating documentation..."];
    setState(prev => ({ ...prev, isGeneratingDocs: true, progress: 0, currentStep: steps[0] }));

    try {
      for (let i = 0; i < steps.length; i++) {
        setState(prev => ({ ...prev, currentStep: steps[i], progress: ((i + 1) / steps.length) * 100 }));
        toast.info(steps[i]);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      const docs = await apiCall(`${BASE_URL}/repositories/generate-docs/${state.repo.id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${JWT_TOKEN}`, "Content-Type": "application/json" },
        body: JSON.stringify({ repo: state.repo }),
      });

      const timestamp = new Date().toISOString();
      const updatedHistory = [...(state.repo.documentationHistory || []), { content: docs.content || docs, timestamp }];
      const updatedRepo = { ...state.repo, documentation: docs.content || docs, documentationHistory: updatedHistory, updatedAt: timestamp };

      setState(prev => ({
        ...prev,
        repo: updatedRepo,
        documentation: { content: docs.content || docs, repoId: state.repo.id },
        isGeneratingDocs: false,
        progress: 0,
        currentStep: '',
        errors: { ...prev.errors, generate: undefined }
      }));
      toast.success("Documentation generated successfully");
    } catch (err) {
      setState(prev => ({
        ...prev,
        errors: { ...prev.errors, generate: err.message || "Failed to generate documentation" },
        isGeneratingDocs: false,
        progress: 0,
        currentStep: ''
      }));
      toast.error(err.message || "Failed to generate documentation");
    }
  }, [state.repo, state.uploadedFiles]);

  const inviteCollaborator = useCallback(async () => {
    if (!state.inviteEmail) {
      toast.error("Please enter an email address");
      return;
    }

    try {
      await apiCall(`${BASE_URL}/repositories/${repoId}/invite`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${JWT_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: state.inviteEmail,
          permission: state.invitePermission,
          repoId: repoId
        }),
      });

      setState(prev => ({
        ...prev,
        collaborators: [...prev.collaborators, { email: state.inviteEmail, permission: state.invitePermission }],
        showInviteDialog: false,
        inviteEmail: '',
        invitePermission: 'read'
      }));
      toast.success(`Successfully invited ${state.inviteEmail}`);
    } catch (err) {
      toast.error("Failed to invite collaborator: " + err.message);
    }
  }, [state.inviteEmail, state.invitePermission, repoId]);

  useEffect(() => {
    if (!state.hasFetched) {
      fetchRepoData(true);
    }
  }, [fetchRepoData]);

  const deepEqual = (obj1, obj2) => {
    if (obj1 === obj2) return true;
    if (!obj1 || !obj2 || typeof obj1 !== 'object' || typeof obj2 !== 'object') return false;
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    if (keys1.length !== keys2.length) return false;
    return keys1.every(key => deepEqual(obj1[key], obj2[key]));
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = new Date(timestamp);
    return isNaN(date.getTime()) ? "N/A" : date.toLocaleString();
  };

  const FileExplorer = memo(({ files }) => {
    const fileTree = buildFileTree(files || []);

    const toggleFolder = (path) => {
      setState(prev => {
        const newExpanded = new Set(prev.expandedFolders);
        if (newExpanded.has(path)) newExpanded.delete(path);
        else newExpanded.add(path);
        return { ...prev, expandedFolders: newExpanded };
      });
    };

    const renderTree = (node, path = "root") => (
      <div className={node.name !== "root" ? "ml-4" : ""}>
        {node.isFolder ? (
          <div>
            <div className="flex items-center gap-2 py-2 text-sm text-muted-foreground hover:bg-muted rounded-md transition-colors duration-200 cursor-pointer">
              <button onClick={() => toggleFolder(path)} className="flex items-center gap-1 flex-1">
                {state.expandedFolders.has(path) ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <ChevronLeft className="h-4 w-4" />
                )}
                <Folder className="h-4 w-4 text-primary" />
                <span className="truncate">{node.name}</span>
              </button>
            </div>
            {state.expandedFolders.has(path) && (
              <div>
                {node.children.map(child => renderTree(child, `${path}/${child.name}`))}
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 py-2 text-sm rounded-md transition-colors duration-200">
            <div
              className={`flex items-center gap-2 flex-1 cursor-pointer ${state.selectedFile === path
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:bg-muted"
                }`}
              onClick={() => setState(prev => ({ ...prev, selectedFile: path }))}
            >
              <File className="h-4 w-4 text-primary" />
              <span className="truncate">{node.name}</span>
            </div>
          </div>
        )}
      </div>
    );

    return (
      <div className="w-72 flex-shrink-0 bg-background border-r border-border">
        <div className="p-4 border-b border-border flex justify-between items-center">
          <h3 className="text-xl font-semibold text-foreground">Files</h3>
          {state.repo?.source === "local" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setState(prev => ({ ...prev, showUploadDialog: true }))}
            >
              <Upload className="h-4 w-4" />
            </Button>
          )}
        </div>
        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="p-4">
            {files?.length > 0 ? renderTree(fileTree) : (
              <p className="text-sm text-muted-foreground italic">No files available</p>
            )}
          </div>
        </ScrollArea>
      </div>
    );
  });

  const UploadDialog = memo(() => (
    <Dialog open={state.showUploadDialog} onOpenChange={(open) => setState(prev => ({ ...prev, showUploadDialog: open }))}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Code Folder</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Input
            type="file"
            webkitdirectory="true"
            directory=""
            multiple
            onChange={handleFolderUpload}
            className="w-full"
          />
          <p className="text-sm text-muted-foreground mt-2">
            Select a folder containing your code files
          </p>
        </div>
      </DialogContent>
    </Dialog>
  ));

  const InviteDialog = memo(() => {
    const [email, setEmail] = useState(state.inviteEmail);
    const [permission, setPermission] = useState(state.invitePermission);

    const handleInvite = () => {
      setState(prev => ({ ...prev, inviteEmail: email, invitePermission: permission }));
      inviteCollaborator();
    };

    return (
      <Dialog open={state.showInviteDialog} onOpenChange={(open) => setState(prev => ({ ...prev, showInviteDialog: open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite a Collaborator</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <label className="text-sm text-muted-foreground">Email</label>
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter collaborator's email"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground ">Permission</label>
              <Select value={permission} onValueChange={setPermission}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select permission" />
                </SelectTrigger>
                <SelectContent className="bg-[#0d1117] text-white border border-gray-700">
                  <SelectItem value="read"> <span>Read </span></SelectItem>
                  <SelectItem value="write"><span>Write</span></SelectItem>
                  <SelectItem value="admin"><span>Admin</span></SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleInvite} className="w-full">
              Send Invite
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  });

  const DocumentationPreview = memo(({ content, repoName, onClose, onDownload }) => {
    const [activeTab, setActiveTab] = useState("preview");

    const handleCopy = useCallback(() => {
      navigator.clipboard.writeText(content);
      toast.success("Copied to clipboard!");
    }, [content]);

    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl bg-background text-foreground border border-border rounded-lg p-0">
          <div className="flex flex-col h-[80vh] w-full">
            <div className="flex items-center justify-between p-3 bg-muted border-b border-border">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">Documentation - {repoName || "Unnamed"}</span>
                <div className="flex gap-1 bg-muted rounded-md p-1">
                  <button
                    onClick={() => setActiveTab("preview")}
                    className={`px-3 py-1 text-sm rounded-md ${activeTab === "preview" ? "bg-background text-foreground" : "text-muted-foreground hover:bg-background"}`}
                  >
                    Preview
                  </button>
                  <button
                    onClick={() => setActiveTab("raw")}
                    className={`px-3 py-1 text-sm rounded-md ${activeTab === "raw" ? "bg-background text-foreground" : "text-muted-foreground hover:bg-background"}`}
                  >
                    Raw
                  </button>
                </div>
              </div>
            </div>
            <ScrollArea className="flex-1 p-6">
              {activeTab === "preview" ? (
                <div className="prose prose-invert max-w-none">
                  <ReactMarkdown>{content}</ReactMarkdown>
                </div>
              ) : (
                <pre className="text-sm bg-muted p-4 rounded-md border border-border whitespace-pre-wrap">{content}</pre>
              )}
            </ScrollArea>
            <div className="p-4 border-t border-border bg-muted flex justify-end gap-2">
              <Button onClick={handleCopy} variant="outline" className="flex items-center gap-2">
                <Copy className="h-4 w-4" />
                Copy
              </Button>
              <Button onClick={onDownload} className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Download
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  });

  return (
    <Suspense fallback={<LoadingAnimation />}>
      <div className="flex h-screen mt-5">
        {!state.hasFetched ? (
          <LoadingAnimation />
        ) : (
          <>

            {state.errors.fetch && (
              <div className="p-10 w-full flex items-center justify-center">
                <Alert variant="destructive" className="max-w-md">
                  <AlertDescription className="flex items-center justify-between">
                    <span>{state.errors.fetch}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fetchRepoData(true)}
                      className="ml-4 bg-background hover:bg-muted text-foreground border-primary hover:border-primary/80 transition-colors duration-200"
                    >
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin-hover" />
                      Retry
                    </Button>
                  </AlertDescription>
                </Alert>
              </div>
            )}

            {state.repo && (
              <>
                <FileExplorer files={state.repo.files || []} />
                <div className="flex-1 flex flex-col">
                  <header className="border-b border-border p-4 flex items-center justify-between bg-background">
                    <div className="flex items-center space-x-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/project/${state.projectId}`)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <h1 className="text-lg font-medium text-foreground">{state.repo.name}</h1>
                    </div>

                  </header>

                  <main className="p-6 flex-1 overflow-y-auto">
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-lg font-semibold text-foreground mb-4">Repository Details</h2>
                        <p className="text-sm text-muted-foreground">Source: {state.repo.source || "N/A"}</p>
                        <p className="text-sm text-muted-foreground">URL: {state.repo.url || "N/A"}</p>
                        <p className="text-sm text-muted-foreground">
                          Files: {state.repo.files?.length || 0} | Created: {formatDate(state.repo.createdAt)} | Updated: {formatDate(state.repo.updatedAt)}
                        </p>
                      </div>

                      {state.selectedFile && (
                        <div className="bg-muted p-4 rounded-md">
                          <h3 className="text-sm font-semibold mb-2">Selected File: {state.selectedFile}</h3>
                          <p className="text-sm text-muted-foreground">Click another file to view its details</p>
                        </div>
                      )}

                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-sm font-semibold text-foreground">Collaborators</h3>
                        </div>
                        {state.collaborators.length > 0 ? (
                          <div className="space-y-2">
                            {state.collaborators.map((collaborator, index) => (
                              <div
                                key={index}
                                className="p-3 bg-muted rounded-md border border-border flex items-center gap-2"
                              >
                                <Users className="h-4 w-4 text-primary" />
                                <span className="text-sm text-foreground">
                                  {collaborator.email} ({collaborator.permission})
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground italic">No collaborators yet</p>
                        )}
                      </div>

                      {state.repo.documentationHistory?.length > 0 && (
                        <div>
                          <h3 className="text-sm font-semibold text-foreground mb-3">Documentation Versions</h3>
                          {state.repo.documentationHistory.map((doc, index) => {
                            const version = `V_${state.repo.documentationHistory.length - index}.0`;
                            return (
                              <div
                                key={index}
                                className="p-3 bg-muted rounded-md border border-border mb-2 cursor-pointer hover:bg-muted/80 transition-colors duration-200"
                                onClick={() => setState(prev => ({ ...prev, documentation: { content: doc.content, repoId: state.repo.id } }))}
                              >
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-primary" />
                                  <span className="text-sm font-medium text-foreground">{version}</span>
                                  <span className="text-xs text-muted-foreground">{formatDate(doc.timestamp)}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      <div className="mt-6 flex flex-col items-center justify-center min-h-[150px]">
                        {state.isGeneratingDocs ? (
                          <DocumentationGenerator/>
                        ) : (
                          <div className="flex flex-col items-center gap-4 w-full max-w-md">
                            {state.errors.generate && (
                              <Alert variant="destructive" className="w-full">
                                <AlertDescription className="flex items-center justify-between">
                                  <span>{state.errors.generate}</span>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={generateDocs}
                                    className="ml-4 bg-background hover:bg-muted text-foreground border-primary hover:border-primary/80 transition-colors"
                                  >
                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin-hover" />
                                    Retry
                                  </Button>
                                </AlertDescription>
                              </Alert>
                            )}
                            <Button
                              onClick={generateDocs}
                              className="w-full flex items-center justify-center gap-2"
                            >
                              <FileText className="h-4 w-4" />
                              {state.repo.documentation ? "Regenerate Docs" : "Generate Docs"}
                            </Button>
                          </div>
                        )}
                      </div>

                    </div>
                  </main>

                  <footer className="h-6 border-t border-border bg-muted flex items-center px-3 justify-between text-xs text-muted-foreground">
                    <div className="flex items-center">
                      <FileCheck className="h-3.5 w-3.5 mr-1" />
                      {state.repo.files?.length || 0} files
                    </div>
                  </footer>
                </div>

                {state.documentation && (
                  <DocumentationPreview
                    content={state.documentation.content}
                    repoName={state.repo.name}
                    onClose={() => setState(prev => ({ ...prev, documentation: null }))}
                    onDownload={() => {
                      const blob = new Blob([state.documentation.content], { type: "text/markdown" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `${state.repo.name || "document"}_docs.md`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                  />
                )}
                <UploadDialog />
                <InviteDialog />
              </>
            )}
          </>
        )}
      </div>
    </Suspense>
  );
});

export default RepoPage;



const DocumentationGenerator = () => {
  const [progressWidth, setProgressWidth] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const steps = [
    "Reading file contents...",
    "Cleaning data...",
    "Chunking data...",
    "Giving to AI...",
    "Formatting output..."
  ];

  useEffect(() => {
    // Progress bar animation
    const progressInterval = setInterval(() => {
      setProgressWidth(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 1;
      });
    }, 100);

    // Status text animation
    const statusInterval = setInterval(() => {
      setCurrentStep(prev => (prev + 1) % steps.length);
    }, 2000);

    return () => {
      clearInterval(progressInterval);
      clearInterval(statusInterval);
    };
  }, []);

  return (
      <div className="bg-zinc-900 w-full max-w-lg rounded-lg p-6 text-white">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-green-400">{">"}</span>
          <span className="text-white font-medium">Generating Documentation</span>
        </div>
        
        <div className="flex items-center mb-6 bg-zinc-700 rounded-full h-2 overflow-hidden">
          <div 
            className="h-full bg-green-400 rounded-full transition-all duration-300 ease-out" 
            style={{ width: `${progressWidth}%` }}
          ></div>
        </div>
        
        <div className="bg-zinc-800 rounded-md p-4 mb-4">
          <div className="flex items-center mb-6 text-green-400 text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            README.md
          </div>
          
          <div className="space-y-4">
            <div className="bg-zinc-700/30 h-3 rounded w-full"></div>
            <div className="bg-zinc-700/30 h-3 rounded w-5/6"></div>
            <div className="bg-zinc-700/30 h-3 rounded w-4/6"></div>
            
            <div className="flex items-center justify-center py-3 text-zinc-500 text-sm font-mono">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
              </svg>
              <span className="min-w-32 text-center transition-opacity duration-300 ease-in-out">
                {steps[currentStep]}
              </span>
              <span className="ml-1 animate-blink">|</span>
            </div>
            
            <div className="bg-zinc-700/30 h-3 rounded w-5/6"></div>
            <div className="bg-zinc-700/30 h-3 rounded w-full"></div>
            <div className="bg-zinc-700/30 h-3 rounded w-3/6"></div>
          </div>
        </div>
        
        <div className="text-zinc-500 text-xs">
          Processed {Math.min(Math.floor(progressWidth / 20) + 1, 6)} of 6 files
        </div>
      </div>
  );
};

// Adding a blink animation for the cursor
const style = document.createElement('style');
style.textContent = `
  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }
  .animate-blink {
    animation: blink 1s step-end infinite;
  }
`;
document.head.appendChild(style);

