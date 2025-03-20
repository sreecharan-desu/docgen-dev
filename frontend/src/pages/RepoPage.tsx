import { useParams } from "react-router-dom";
import React, { useState, useEffect, useCallback, memo, Suspense } from "react";
import {
  ChevronLeft,
  FileText,
  Clock,
  Download,
  Copy,
  File,
  GitBranch,
  FileCheck,
  RefreshCw,
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

// API utility with retry logic
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

const BASE_URL = "https://api2.docgen.dev/api/v1";
const JWT_TOKEN = localStorage.getItem("token");

const RepoPage = memo(() => {
  const { id: repoId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [state, setState] = useState({
    projectId: '',
    repo: null,
    isLoading: true,
    errors: {},
    isGeneratingDocs: false,
    documentation: null,
    progress: 0,
    hasFetched: false
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
        if (force || !deepEqual(prev.repo, newRepoData)) {
          return {
            ...prev,
            repo: newRepoData,
            projectId: newRepoData.project_id,
            isLoading: false,
            hasFetched: true
          };
        }
        return { ...prev, isLoading: false, hasFetched: true };
      });
    } catch (err) {
      setState(prev => ({
        ...prev,
        errors: { fetch: err.message || "Error fetching repository" },
        isLoading: false,
        hasFetched: true
      }));
    }
  }, [repoId, JWT_TOKEN, navigate]);

  const generateDocs = useCallback(async () => {
    if (!state.repo) return;

    setState(prev => ({ ...prev, isGeneratingDocs: true, progress: 0 }));
    const steps = ["Reading files...", "Cleaning data...", "Extracting insights...", "Generating documentation..."];

    try {
      for (let i = 0; i < steps.length; i++) {
        toast.info(steps[i]);
        setState(prev => ({ ...prev, progress: ((i + 1) / steps.length) * 100 }));
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      const docs = await apiCall(`${BASE_URL}/repositories/generate-docs/${state.repo.id}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${JWT_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ repo: state.repo }),
      });

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

      setState(prev => ({
        ...prev,
        repo: updatedRepo,
        documentation: { content: docs.content || docs, repoId: state.repo.id },
        isGeneratingDocs: false,
        progress: 0,
        errors: { ...prev.errors, generate: undefined } // Clear generate error on success
      }));
      toast.success("Documentation generated successfully");
    } catch (err) {
      setState(prev => ({
        ...prev,
        errors: { ...prev.errors, generate: err.message || "Failed to generate documentation" },
        isGeneratingDocs: false,
        progress: 0
      }));
      toast.error(err.message || "Failed to generate documentation");
    }
  }, [state.repo]);

  useEffect(() => {
    if (!state.hasFetched) {
      fetchRepoData(true);
    }
  }, [fetchRepoData]);

  useEffect(() => {
    if (state.hasFetched) {
      fetchRepoData();
    }
  }, [repoId]);

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

  const FileExplorer = memo(({ files }) => (
    <div className="w-72 flex-shrink-0 bg-background border-r border-border">
      <div className="p-5 border-b border-border">
        <h3 className="text-xl font-semibold text-foreground">Files</h3>
      </div>
      <ScrollArea className="h-[calc(100vh-200px)]">
        <div className="p-4">
          {files?.length > 0 ? (
            files.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-2 py-2 text-sm text-muted-foreground hover:bg-muted rounded-md transition-colors duration-200"
              >
                <File className="h-4 w-4 text-primary" />
                <span className="truncate">{file}</span>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground italic">No files available</p>
          )}
        </div>
      </ScrollArea>
    </div>
  ));

  const DocumentationPreview = memo(({ content, repoName, onClose, onDownload }) => {
    const [activeTab, setActiveTab] = useState("preview");

    const handleCopy = useCallback(() => {
      navigator.clipboard.writeText(content);
      toast.success("Copied to clipboard!");
    }, [content]);

    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl bg-background text-foreground border border-border rounded-lg p-0">
          <div className="flex flex-col h-[80vh] w-full rounded-lg overflow-hidden">
            <div className="flex items-center justify-between p-3 bg-muted border-b border-border">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">Documentation - {repoName || "Unnamed"}</span>
                <div className="flex gap-1 bg-muted rounded-md p-1 mr-10">
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
              <div className="p-10 w-full">
                <Alert variant="destructive">
                  <AlertDescription>
                    {state.errors.fetch}
                    <Button variant="outline" size="sm" className="ml-4" onClick={() => fetchRepoData(true)}>
                      <RefreshCw className="h-4 w-4 mr-2" />
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
                        <p className="text-sm text-muted-foreground">URL: {state.repo.url || "N/A"}</p>
                        <p className="text-sm text-muted-foreground">
                          Files: {state.repo.files?.length || 0} | Created: {formatDate(state.repo.createdAt)} | Updated: {formatDate(state.repo.updatedAt)}
                        </p>
                      </div>

                      {state.repo.documentationHistory?.length > 0 && (
                        <div>
                          <h3 className="text-sm font-semibold text-foreground mb-3">Documentation Versions</h3>
                          {state.repo.documentationHistory.map((doc, index, arr) => {
                            const version = `V_${Math.floor(arr.length - index)}.${index + 1}.0`;
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

                      <div className="mt-6">
                        {state.isGeneratingDocs ? (
                          <div className="space-y-2">
                            <div style={{ width: `${state.progress}%` }} className="h-2 bg-primary rounded-full transition-all duration-1000" />
                            <p className="text-sm text-muted-foreground text-center">Generating...</p>
                          </div>
                        ) : (
                          <div className="flex justify-center place-content-center">
                            {state.errors.generate && (<>
                              <Alert variant="destructive" className="mb-4">
                                <AlertDescription>
                                  {state.errors.generate}
                                  <Button variant="outline" size="sm" className="ml-4" onClick={generateDocs}>
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Retry
                                  </Button>
                                </AlertDescription>
                              </Alert>
                              <br />
                            </>
                            )}
                            <Button
                              onClick={generateDocs}
                              className="w-1/2 flex items-center justify-center gap-2"
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
              </>
            )}
          </>
        )}
      </div>
    </Suspense>
  );
});




export default RepoPage;