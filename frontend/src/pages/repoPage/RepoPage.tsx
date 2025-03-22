import React, { memo, Suspense, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { LoadingAnimation } from "@/AppRoutes";
import { useRepoState } from "./hooks/useRepoState"; // Custom hook for state and logic
import FileExplorer from "./components/FileExplorer";
import RepositoryDetails from "./components/RepositoryDetails";
import Collaborators from "./components/Collaborators";
import DocumentationHistory from "./components/DocumentationHistory";
import DocumentationActions from "./components/DocumentationActions";
import DocumentationPreview from "./components/DocumentationPreview";
import DocumentationGeneratorDialog from "./components/DocumentationGeneratorDialog";
import { ChevronLeft, FileCheck, RefreshCw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import "./styles/Repopage.css"
import { apiMethods, BASE_URL } from "@/utils/apis";

const RepoPage = memo(() => {
  const { id: repoId } = useParams();
  const navigate = useNavigate();
  const {
    state,
    fetchRepoData,
    handleFolderUpload,
    generateDocs,
    debouncedGenerateDocs,
  } = useRepoState(repoId, navigate);
  const [files, setFiles] = useState([]);

  useEffect(() => {
    const repo_id = repoId;
    const callApi = async () => {
      const resp = await fetch(`${BASE_URL}/storage/list-files/${repo_id}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json"
        }
      });
      const data = await resp.json()
      console.log(data)
      setFiles(data.files)
    }
    callApi();
  }, [])

  return (
    <Suspense fallback={<LoadingAnimation />}>
      <div className="flex h-screen mt-5">
        {!state.hasFetched ? (
          <LoadingAnimation />
        ) : (
          <>
            {state.errors.fetch && (
              <div className="p-10 w-full flex items-center justify-center">
                {/* Error handling UI */}
                <Alert variant="destructive" className="max-w-md">
                  <AlertDescription className="flex items-center justify-between">
                    <span>{state.errors.fetch}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fetchRepoData(true)}
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
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <h1 className="text-lg font-medium text-foreground">{state.repo.name}</h1>
                    </div>
                  </header>

                  <main className="p-6 flex-1 overflow-y-auto">
                    <div className="space-y-6">
                      <RepositoryDetails repo={state.repo} selectedFile={state.selectedFile} />
                      {
                        JSON.stringify(files)
                      }
                      {/* <Collaborators collaborators={state.collaborators} />
                      <DocumentationHistory
                        history={state.repo.documentationHistory}
                        setDocumentation={(doc) =>
                          setState((prev) => ({ ...prev, documentation: doc }))
                        }
                      />
                      <DocumentationActions
                        isGeneratingDocs={state.isGeneratingDocs}
                        errors={state.errors.generate}
                        hasDocs={!!state.repo.documentation}
                        onGenerate={debouncedGenerateDocs}
                      /> */}
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
                    onClose={() => setState((prev) => ({ ...prev, documentation: null }))}
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

                {state.isGeneratingDocs && (
                  <DocumentationGeneratorDialog
                    open={state.isGeneratingDocs}
                    onOpenChange={(open) =>
                      !open &&
                      setState((prev) => ({
                        ...prev,
                        isGeneratingDocs: false,
                        progress: 0,
                        currentStep: "",
                      }))
                    }
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