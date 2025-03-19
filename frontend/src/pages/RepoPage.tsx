import { useParams } from "react-router-dom";
import { useState, useEffect, lazy, Suspense } from "react";
import {
  ChevronLeft,
  FileText,
  Clock,
  Download,
  Copy,
  File,
  GitBranch,
  FileCheck,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { ScrollArea } from "@/components/ui/scroll-area";

// Lazy-loaded UI components
const components = {
  Button: lazy(() =>
    import("@/components/ui/button").then((mod) => ({ default: mod.Button }))
  ),
  Dialog: lazy(() =>
    import("@/components/ui/dialog").then((mod) => ({ default: mod.Dialog }))
  ),
  DialogContent: lazy(() =>
    import("@/components/ui/dialog").then((mod) => ({
      default: mod.DialogContent,
    }))
  ),
  DialogHeader: lazy(() =>
    import("@/components/ui/dialog").then((mod) => ({
      default: mod.DialogHeader,
    }))
  ),
  DialogTitle: lazy(() =>
    import("@/components/ui/dialog").then((mod) => ({
      default: mod.DialogTitle,
    }))
  ),
};

const { Button, Dialog, DialogContent, DialogHeader, DialogTitle } = components;

// Hard-coded repository data
const HARDCODED_REPO = {
  id: "repo-123",
  name: "Sample Repository",
  url: "https://github.com/user/sample-repo",
  files: ["README.md", "index.js", "package.json"],
  documentationHistory: [
    {
      content: "# Sample Documentation\n\nThis is a sample documentation.",
      timestamp: "2023-10-01T12:00:00Z",
    },
  ],
  createdAt: "2023-09-01T10:00:00Z",
  updatedAt: "2023-10-01T12:00:00Z",
  projectId: "project-456",
};


const BASE_URL = "https://api2.docgen.dev/api/v1";
const JWT_TOKEN = localStorage.getItem("token");


const GET_REPO_API = async (repo_id, token) => {
  const response = await fetch(`${BASE_URL}/repositories/get-repository/${repo_id}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) throw new Error("Failed to fetch repositories");
  return await response.json();
};

// Mock function to generate documentation
const GENERATE_DOCS_API = async (repo) => {
  try {
    await new Promise((resolve) => setTimeout(resolve, 3000));
    const mockDocs = `
# ${repo.name} Documentation

## Overview
This is a clean, minimalistic documentation for the ${repo.name} repository.

## Files
${repo.files
        .map((file) => `- **${file}**: Automatically generated description`)
        .join("\n")}

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

const RepoPage = () => {
  const { id: repoId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projectid, setProjectId] = useState('');
  const [repo, setRepo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isGeneratingDocs, setIsGeneratingDocs] = useState(false);
  const [documentation, setDocumentation] = useState(null);
  const [progress, setProgress] = useState(0);

  const JWT_TOKEN = localStorage.getItem("token") || "mock-token";

  // Use hard-coded repository data on mount
  useEffect(() => {
    if (!JWT_TOKEN) navigate("/");

    const fetchRepo = async () => {

      setIsLoading(true);
      setError("");
      try {
        const apirepoData = await GET_REPO_API(repoId, JWT_TOKEN);
        console.log(apirepoData);
        setRepo(apirepoData);
        setProjectId(apirepoData.project_id)

      } catch (err) {
        setError(err.message || "Error fetching repository. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchRepo();
  }, [JWT_TOKEN, navigate]);

  // Generate documentation
  const generateDocumentation = async () => {
    if (!repo) return;
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
      const docs = await GENERATE_DOCS_API(repo);
      const timestamp = new Date().toISOString();
      const updatedHistory = [
        ...(repo.documentationHistory || []),
        { content: docs, timestamp },
      ];
      const updatedRepo = {
        ...repo,
        documentation: docs,
        documentationHistory: updatedHistory,
        updatedAt: timestamp,
      };

      // Update state directly without local storage
      setRepo(updatedRepo);
      setDocumentation({ content: docs, repoId: repo.id });
      toast.success("Documentation generated successfully");
    } catch (err) {
      toast.error(err.message || "Failed to generate documentation");
    } finally {
      setIsGeneratingDocs(false);
      setProgress(0);
    }
  };

  // Format date
  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = new Date(timestamp);
    return isNaN(date.getTime()) ? "N/A" : date.toLocaleString();
  };

  // Render file explorer
  const renderFileExplorer = (files) => (
    <div className="w-72 flex-shrink-0 bg-background border-r border-border">
      <div className="p-4 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">Files</h3>
      </div>
      <ScrollArea className="h-[calc(100vh-200px)]">
        <div className="p-4">
          {files.length > 0 ? (
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
            <p className="text-sm text-muted-foreground italic">
              No files available
            </p>
          )}
        </div>
      </ScrollArea>
    </div>
  );

  // Documentation Preview Component
  const DocumentationPreview = ({ content, repoName, onClose, onDownload }) => {
    const [activeTab, setActiveTab] = useState("preview");

    const handleCopy = () => {
      navigator.clipboard.writeText(content);
      toast.success("Copied to clipboard!");
    };

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
                <span className="text-sm font-medium">
                  Documentation - {repoName || "Unnamed"}
                </span>
                <div className="flex gap-1 bg-muted rounded-md p-1 mr-10">
                  <button
                    onClick={() => setActiveTab("preview")}
                    className={`px-3 py-1 text-sm rounded-md ${activeTab === "preview"
                        ? "bg-background text-foreground"
                        : "text-muted-foreground hover:bg-background"
                      }`}
                  >
                    Preview
                  </button>
                  <button
                    onClick={() => setActiveTab("raw")}
                    className={`px-3 py-1 text-sm rounded-md ${activeTab === "raw"
                        ? "bg-background text-foreground"
                        : "text-muted-foreground hover:bg-background"
                      }`}
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
                <pre className="text-sm bg-muted p-4 rounded-md border border-border whitespace-pre-wrap">
                  {content}
                </pre>
              )}
            </ScrollArea>
            <div className="p-4 border-t border-border bg-muted flex justify-end gap-2">
              <Button
                onClick={handleCopy}
                variant="outline"
                className="flex items-center gap-2"
              >
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
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return <div className="p-10 text-center text-red-500">{error}</div>;
  }

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <div className="flex h-screen mt-5">
        {/* File Explorer Sidebar */}
        {renderFileExplorer(repo.files || [])}

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <header className="border-b border-border p-4 flex items-center justify-between bg-background">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(`/project/${repo.project_id}`)}
                className="text-muted-foreground hover:text-foreground"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-lg font-medium text-foreground">
                {repo.name}
              </h1>
            </div>
          </header>

          <main className="p-6 flex-1 overflow-y-auto">
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-4">
                  Repository Details
                </h2>
                <p className="text-sm text-muted-foreground">
                  URL: {repo.url || "N/A"}
                </p>
                <p className="text-sm text-muted-foreground">
                  Files: {repo.files?.length || 0} | Created:{" "}
                  {formatDate(repo.createdAt)} | Updated:{" "}
                  {formatDate(repo.updatedAt)}
                </p>
              </div>

              {repo.documentationHistory?.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3">
                    Documentation Versions
                  </h3>
                  {repo.documentationHistory.map((doc, index, arr) => {
                    const version = `V_${Math.floor(arr.length - index)}.${index + 1
                      }.0`;
                    return (
                      <div
                        key={index}
                        className="p-3 bg-muted rounded-md border border-border mb-2 cursor-pointer hover:bg-muted/80 transition-colors duration-200"
                        onClick={() =>
                          setDocumentation({
                            content: doc.content,
                            repoId: repo.id,
                          })
                        }
                      >
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium text-foreground">
                            {version}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(doc.timestamp)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="mt-6">
                {isGeneratingDocs ? (
                  <div className="space-y-2">
                    <div
                      style={{ width: `${progress}%` }}
                      className="h-2 bg-primary rounded-full transition-all duration-1000"
                    />
                    <p className="text-sm text-muted-foreground text-center">
                      Generating...
                    </p>
                  </div>
                ) : (
                  <Button
                    onClick={generateDocumentation}
                    className="w-full flex items-center justify-center gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    {repo.documentation ? "Regenerate Docs" : "Generate Docs"}
                  </Button>
                )}
              </div>
            </div>
          </main>

          <footer className="h-6 border-t border-border bg-muted flex items-center px-3 justify-between text-xs text-muted-foreground">
            <div className="flex items-center">
              <GitBranch className="h-3.5 w-3.5 mr-1" />
              main
            </div>
            <div className="flex items-center">
              <FileCheck className="h-3.5 w-3.5 mr-1" />
              {repo.files?.length || 0} files
            </div>
          </footer>
        </div>

        {/* Documentation Preview */}
        {documentation && (
          <DocumentationPreview
            content={documentation.content}
            repoName={repo.name}
            onClose={() => setDocumentation(null)}
            onDownload={() => {
              const blob = new Blob([documentation.content], {
                type: "text/markdown",
              });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `${repo.name || "document"}_docs.md`;
              a.click();
              URL.revokeObjectURL(url);
            }}
          />
        )}
      </div>
    </Suspense>
  );
};

// Loading Spinner
const LoadingSpinner = () => (
  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary mx-auto"></div>
);

export default RepoPage;
