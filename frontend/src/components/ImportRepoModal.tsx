/* eslint-disable @typescript-eslint/no-unused-expressions */
import React, { useState, useRef, useCallback } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { FileUp, FolderGit2, FileText, Folder, X, Loader2, FileCheck, GitBranch, Download, RefreshCw, ChevronDown, ChevronRight, File } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

// TypeScript interface for props
interface ImportRepoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (url: string, type: string, source: string) => Promise<void>;
  projectId: string | undefined;
}

declare module "react" {
  interface HTMLAttributes<T> extends React.DOMAttributes<T> {
    webkitdirectory?: string;
    directory?: string;
  }
}

// API Placeholder with artificial delay
const IMPORT_LOCAL_REPO_API = async (
  projectId: string | undefined,
  repoData: { name: string; url: string; type: string; source: string; files: string[] },
  token: string
) => {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  const newRepo = {
    id: Date.now(),
    ...repoData,
    projectId,
  };
  const existingRepos = JSON.parse(localStorage.getItem(`repos_${projectId}_${newRepo.id}`)) || [];
  const updatedRepos = [...existingRepos, newRepo];
  localStorage.setItem(`repos_${projectId}_${newRepo.id}`, JSON.stringify(updatedRepos));
  return newRepo;
};

const ImportRepoModal: React.FC<ImportRepoModalProps> = ({ isOpen, onClose, onImport, projectId }) => {
  const [step, setStep] = useState<"name" | "files" | "vscode" | "loading">("name");
  const [repoName, setRepoName] = useState("");
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const JWT_TOKEN = localStorage.getItem("token") || "mock-token";

  const resetForm = useCallback(() => {
    setStep("name");
    setRepoName("");
    setSelectedFolder(null);
    setFiles([]);
    setIsSubmitting(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const handleModalClose = useCallback(() => {
    resetForm();
    onClose();
  }, [onClose, resetForm]);

  const handleNextStep = useCallback(() => {
    if (!repoName.trim()) {
      toast.error("Please enter a repository name");
      return;
    }
    setStep("files");
  }, [repoName]);

  const handleFileUpload = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (fileList && fileList.length > 0) {
      setStep("loading");
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const folderName = fileList[0].webkitRelativePath.split("/")[0];
      const fileArray = Array.from(fileList);
      setSelectedFolder(folderName);
      setFiles(fileArray);
      setStep("vscode");
      toast.success(`Folder "${folderName}" loaded with ${fileArray.length} files`);
    } else {
      toast.error("No folder selected");
    }
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedFolder(null);
    setFiles([]);
    setStep("files");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const handleImport = useCallback(async () => {
    if (!files.length || !repoName) return;

    setIsSubmitting(true);
    setStep("loading");
    try {
      const mockUrl = `local://${repoName}`;
      await onImport(mockUrl, "local", "local");

      const repoData = {
        name: repoName,
        url: mockUrl,
        type: "local",
        source: "local",
        files: files.map((file) => file.name),
      };

      await IMPORT_LOCAL_REPO_API(projectId, repoData, JWT_TOKEN);

      toast.success(`Repository "${repoName}" imported successfully`);
      handleModalClose();
    } catch (error) {
      toast.error("Failed to import repository");
      console.error(error);
      setStep("vscode");
    } finally {
      setIsSubmitting(false);
    }
  }, [files, repoName, onImport, projectId, handleModalClose]);

  const renderFileExplorer = () => {
    const groupedFiles = files.reduce((acc, file) => {
      const pathParts = file.webkitRelativePath.split("/");
      const dir = pathParts.slice(0, -1).join("/");
      if (!acc[dir]) acc[dir] = [];
      acc[dir].push(file);
      return acc;
    }, {} as Record<string, File[]>);

    return (
      <ScrollArea className="h-[calc(100vh-200px)] w-[300px] border-r border-gray-600 rgb(13 17 23 / 0.3) text-gray-200">
        <div className="p-2">
          <div className="p-2 text-xs uppercase tracking-wider text-gray-400">
            Explorer
          </div>
          {Object.entries(groupedFiles).map(([dir, dirFiles]) => (
            <div key={dir} className="ml-2">
              <div className="flex items-center gap-1 py-1">
                <Folder className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-200">{dir || selectedFolder}</span>
              </div>
              <div className="ml-4">
                {dirFiles.map((file, index) => (
                  <div key={index} className="flex items-center gap-1 py-1">
                    <FileText className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-300">{file.name}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    );
  };

  const renderLoadingState = () => (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] w-full rgb(13 17 23 / 0.3) rounded-lg p-6">
      <Loader2 className="h-16 w-16 text-teal-500 animate-spin" />
      <h2 className="text-lg font-medium text-white mt-6">
        {isSubmitting ? "Importing Repository..." : "Processing Files..."}
      </h2>
      <p className="text-sm text-gray-400 mt-2">
        {isSubmitting ? "Adding to project..." : "Analyzing folder structure..."}
      </p>
    </div>
  );
  const renderVSCodeInterface = () => (
    <div className="flex h-[calc(100vh-100px)] w-full bg-background border border-border rounded-lg overflow-hidden">
      {/* File Explorer - Now with scrollable sidebar */}
      <div className="w-64 border-r border-border bg-black flex flex-col">
        <div className="p-3 border-b border-border flex items-center justify-between">
          <span className="text-sm font-medium">EXPLORER</span>
          <RefreshCw className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground cursor-pointer" />
        </div>

        {/* Made this div scrollable */}
        <div className="p-2 flex-1 overflow-y-auto">
          <div className="text-xs text-muted-foreground mb-2 font-medium uppercase flex items-center">
            <ChevronDown className="h-3.5 w-3.5 mr-1" />
            {selectedFolder}
          </div>

          <div className="space-y-1 ml-2">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center text-sm py-1 px-2 rounded hover:bg-gray-700 cursor-pointer group"
              >
                {file.type === 'folder' ? (
                  <Folder className="h-4 w-4 mr-2 text-muted-foreground" />
                ) : (
                  <File className="h-4 w-4 mr-2 text-muted-foreground" />
                )}
                <span className="truncate text-sm">{file.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col">
        {/* Editor Tabs - Removed the X button */}
        <div className="flex items-center p-1.5 bg-background border-b border-border relative">
          <div className="flex items-center absolute left-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500 ml-1.5" />
            <div className="w-3 h-3 rounded-full bg-green-500 ml-1.5" />
          </div>

          <div className="flex items-center mx-auto">
            <span className="text-xs text-muted-foreground">{repoName} - Preview</span>
          </div>

          {/* X button removed from here */}
        </div>

        {/* Editor Content */}
        <div className="flex-1 bg-background p-6 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto">
            <FileCheck className="h-10 w-10 mx-auto mb-4 text-primary" />
            <h2 className="text-lg font-medium mb-2 text-center">Repository: {repoName}</h2>
            <p className="text-sm text-muted-foreground mb-6 text-center">
              {files.length} files ready for import from "{selectedFolder}"
            </p>

            <div className="flex justify-center">
              <Button
                onClick={handleImport}
                disabled={isSubmitting}
                className="flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-1" />
                    Import
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Status Bar */}
        <div className="h-6 border-t border-border bg-black flex items-center px-3 justify-between">
          <div className="flex items-center text-xs">
            <GitBranch className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
            <span className="text-muted-foreground">main</span>
          </div>
          <div className="flex items-center text-xs text-muted-foreground">
            <FileCheck className="h-3.5 w-3.5 mr-1" />
            {files.length} files
          </div>
        </div>
      </div>
    </div>
  );

  const renderInitialPopup = () => (
    <div className="p-6 rgb(13 17 23 / 0.3) rounded-lg border border-gray-600">
      <div className="flex flex-col items-center justify-center p-8">
        <h3 className="text-lg font-medium text-white mb-3">Name Your Repository</h3>
        <p className="text-sm text-gray-400 mb-6 text-center max-w-xs">
          Provide a unique name to begin importing your repository
        </p>
        <div className="w-full max-w-md space-y-4">
          <div className="space-y-2">
            <Label htmlFor="repoName" className="text-gray-200 font-medium">
              Repository Name
            </Label>
            <Input
              id="repoName"
              value={repoName}
              onChange={(e) => setRepoName(e.target.value)}
              placeholder="e.g., MyAwesomeProject"
              className="rgb(13 17 23 / 0.3) border-gray-600 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 rounded-md"
            />
          </div>
          <Button
            onClick={handleNextStep}
            className="w-full bg-teal-500 hover:bg-teal-600 text-white font-medium py-2 px-4 rounded-md"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );

  const renderFileSelection = () => (
    <div className="p-6 rgb(13 17 23 / 0.3) rounded-lg border border-gray-600">
      <div className="flex flex-col items-center justify-center p-6">
        <FolderGit2 className="h-10 w-10 text-gray-400" />
        <h3 className="text-base font-medium text-white mb-2">Select Repository Files for "{repoName}"</h3>
        <Button
          onClick={handleFileUpload}
          variant="secondary"
          disabled={isSubmitting}
          className="rgb(13 17 23 / 0.3) text-gray-200 hover:bg-gray-600 py-2 px-4 rounded-md border border-gray-600"
        >
          <FileUp className="mr-2 h-4 w-4" />
          Select Folder
        </Button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          webkitdirectory="true"
          directory="true"
          className="hidden"
          disabled={isSubmitting}
        />
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleModalClose}>
      <DialogContent
        className={`${step === "vscode" || step === "loading" ? "max-w-[90vw] max-h-[90vh] p-0" : "sm:max-w-[425px]"
          } rgb(13 17 23 / 0.3) text-gray-200 border-gray-600 rounded-lg`}
      >
        {step === "name" && renderInitialPopup()}
        {step === "files" && renderFileSelection()}
        {step === "vscode" && renderVSCodeInterface()}
        {step === "loading" && renderLoadingState()}
      </DialogContent>
    </Dialog>
  );
};

export default ImportRepoModal;