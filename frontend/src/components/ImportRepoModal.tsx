/* eslint-disable @typescript-eslint/no-unused-expressions */
import React, { useState, useRef, useCallback } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  FileUp,
  FolderGit2,
  FileText,
  Folder,
  X,
  Loader2,
  FileCheck,
  Download,
  ChevronDown,
  ChevronRight,
  GitBranch,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@radix-ui/react-select";
import { Select } from "./ui/select";

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
  repoData: {
    name: string;
    url: string;
    type: string;
    source: string;
    files: string[];
  },
  token: string
) => {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  const newRepo = {
    id: Date.now(),
    ...repoData,
    projectId,
  };
  const existingRepos =
    JSON.parse(localStorage.getItem(`repos_${projectId}_${newRepo.id}`)) || [];
  const updatedRepos = [...existingRepos, newRepo];
  localStorage.setItem(
    `repos_${projectId}_${newRepo.id}`,
    JSON.stringify(updatedRepos)
  );
  return newRepo;
};

const ImportRepoModal: React.FC<ImportRepoModalProps> = ({
  isOpen,
  onClose,
  onImport,
  projectId,
}) => {
  const [step, setStep] = useState<"files" | "vscode" | "loading">("files");
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [viewMode, setViewMode] = useState<"flat" | "tree">("tree");
  const [filterType, setFilterType] = useState<"all" | "code" | "images">(
    "all"
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const JWT_TOKEN = localStorage.getItem("token") || "mock-token";

  const resetForm = useCallback(() => {
    setStep("files");
    setSelectedFolder(null);
    setFiles([]);
    setIsSubmitting(false);
    setProgress(0);
    setViewMode("tree");
    setFilterType("all");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const handleModalClose = useCallback(() => {
    resetForm();
    onClose();
  }, [onClose, resetForm]);

  const handleFileUpload = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const fileList = e.target.files;
      if (fileList && fileList.length > 0) {
        setStep("loading");
        await new Promise((resolve) => setTimeout(resolve, 1500));
        const folderName = fileList[0].webkitRelativePath.split("/")[0];
        const fileArray = Array.from(fileList);
        setSelectedFolder(folderName);
        setFiles(fileArray);
        setStep("vscode");
        toast.success(
          `Folder "${folderName}" loaded with ${fileArray.length} files`
        );
      } else {
        toast.error("No folder selected");
      }
    },
    []
  );

  const clearSelection = useCallback(() => {
    setSelectedFolder(null);
    setFiles([]);
    setStep("files");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const handleImport = useCallback(async () => {
    if (!files.length) return;

    setIsSubmitting(true);
    setStep("loading");
    setProgress(0);

    const steps = ["Preparing files...", "Uploading...", "Finalizing..."];
    for (let i = 0; i < steps.length; i++) {
      toast.info(steps[i]);
      setProgress(((i + 1) / steps.length) * 100);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    try {
      const repoName = selectedFolder || "UnnamedRepo";
      const mockUrl = `local://${repoName}`;
      const fileNames = files.map((file) => file.name);
      await onImport(mockUrl, "local", "local", fileNames);

      const repoData = {
        name: repoName,
        url: mockUrl,
        type: "local",
        source: "local",
        files: fileNames,
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
      setProgress(0);
    }
  }, [files, selectedFolder, onImport, projectId, handleModalClose]);

  const filteredFiles = useCallback(() => {
    if (filterType === "all") return files;
    return files.filter((file) => {
      const ext = file.name.split(".").pop()?.toLowerCase();
      if (filterType === "code")
        return ["js", "ts", "jsx", "tsx", "py", "java", "cpp"].includes(
          ext || ""
        );
      if (filterType === "images")
        return ["png", "jpg", "jpeg", "gif"].includes(ext || "");
      return true;
    });
  }, [files, filterType]);

  const downloadSample = useCallback(() => {
    const sampleContent = `
# Sample Project
## Folder Structure
- src/
  - main.js
  - styles.css
- README.md
`;
    const blob = new Blob([sampleContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sample_project_structure.txt";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Sample structure downloaded");
  }, []);

  interface ImportRepoModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImport: (
      url: string,
      type: string,
      source: string,
      files: string[]
    ) => Promise<void>;
    projectId: string | undefined;
  }

  const renderFileExplorer = () => {
    const displayedFiles = filteredFiles();
    return (
      <ScrollArea className="h-[calc(100vh-200px)] w-64 border-r border-gray-600 bg-[#1A2525] text-gray-200">
        <div className="p-2">
          <div className="flex items-center justify-between p-2 text-xs uppercase tracking-wider text-gray-400">
            <span>Explorer</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode(viewMode === "tree" ? "flat" : "tree")}
              className="text-gray-400 hover:text-white hover:bg-gray-600 p-1"
            >
              {viewMode === "tree" ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          </div>
          <div className="flex items-center gap-2 p-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={downloadSample}
              className="text-gray-400 hover:text-white hover:bg-gray-600 p-1"
            >
              <Download className="h-4 w-4" />
            </Button>
            <Select
              value={filterType}
              onValueChange={(value) =>
                setFilterType(value as "all" | "code" | "images")
              }
            >
              <SelectTrigger className="w-full bg-[#1A2525] border-gray-600 text-gray-200 text-xs">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent className="bg-[#1A2525] text-gray-200 border-gray-600">
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="code">Code</SelectItem>
                <SelectItem value="images">Images</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {viewMode === "tree" ? (
            <div className="space-y-1">
              {Object.entries(
                displayedFiles.reduce((acc, file) => {
                  const pathParts = file.webkitRelativePath.split("/");
                  const dir = pathParts.slice(0, -1).join("/");
                  if (!acc[dir]) acc[dir] = [];
                  acc[dir].push(file);
                  return acc;
                }, {} as Record<string, File[]>)
              ).map(([dir, dirFiles]) => (
                <div key={dir} className="ml-2">
                  <div className="flex items-center gap-1 py-1">
                    <Folder className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-200">
                      {dir || selectedFolder}
                    </span>
                  </div>
                  <div className="ml-4 space-y-1">
                    {dirFiles.map((file, index) => (
                      <div key={index} className="flex items-center gap-1 py-1">
                        <FileText className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-300">
                          {file.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-1">
              {displayedFiles.map((file, index) => (
                <div key={index} className="flex items-center gap-1 py-1">
                  {file.type === "directory" ? (
                    <Folder className="h-4 w-4 text-gray-400" />
                  ) : (
                    <FileText className="h-4 w-4 text-gray-400" />
                  )}
                  <span className="text-sm text-gray-300">{file.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    );
  };

  const renderLoadingState = () => (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] w-full bg-[#1A2525] rounded-lg p-6">
      <Loader2 className="h-16 w-16 text-teal-500 animate-spin" />
      <h2 className="text-lg font-medium text-white mt-6">
        {isSubmitting ? "Importing Repository..." : "Processing Files..."}
      </h2>
      <p className="text-sm text-gray-400 mt-2">
        {isSubmitting
          ? "Adding to project..."
          : "Analyzing folder structure..."}
      </p>
      {isSubmitting && (
        <div className="w-full mt-4 bg-gray-700 rounded-full h-2.5">
          <div
            className="bg-teal-500 h-2.5 rounded-full transition-all duration-1000"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );

  const renderVSCodeInterface = () => (
    <div className="flex h-[calc(100vh-100px)] w-full bg-[#1A2525] rounded-lg overflow-hidden border border-gray-600">
      {renderFileExplorer()}
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between p-2 bg-[#2A3A3A] border-b border-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <span className="text-sm font-medium text-gray-200">
            {selectedFolder} - Preview
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSelection}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-white hover:bg-gray-600 rounded-full p-2"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1 p-6 bg-[#1A2525] text-gray-200 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-lg font-medium text-white mb-4">
              Repository: {selectedFolder}
            </h2>
            <p className="text-sm text-gray-400 mb-6">
              {files.length} files ready for import from "{selectedFolder}"
            </p>
            <div className="flex justify-center items-center">
              <Button
                onClick={handleImport}
                disabled={isSubmitting}
                className="bg-teal-500 hover:bg-teal-600 text-white font-medium py-2 px-4 rounded-md flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <div className="flex justify-center items-center gap-1">
                      <Download className="h-4 w-4" />
                      Import
                    </div>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
        <div className="h-6 border-t border-gray-600 bg-[#1A2525] flex items-center px-3 justify-between">
          <div className="flex items-center text-xs text-gray-400">
            <GitBranch className="h-3.5 w-3.5 mr-1" />
            main
          </div>
          <div className="flex items-center text-xs text-gray-400">
            <FileCheck className="h-3.5 w-3.5 mr-1" />
            {files.length} files
          </div>
        </div>
      </div>
    </div>
  );

  const renderFileSelection = () => (
    <div className="p-6 bg-[#2A3A3A] rounded-lg border border-gray-600">
      <div className="flex flex-col items-center justify-center p-6">
        <FolderGit2 className="h-10 w-10 text-gray-400" />
        <h3 className="text-base font-medium text-white mb-2">
          Select Repository Folder
        </h3>
        <Button
          onClick={handleFileUpload}
          variant="secondary"
          disabled={isSubmitting}
          className="bg-[#1A2525] text-gray-200 hover:bg-gray-600 py-2 px-4 rounded-md border border-gray-600 flex items-center gap-2"
        >
          <FileUp className="h-4 w-4" />
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
        className={`${
          step === "vscode" || step === "loading"
            ? "max-w-[90vw] max-h-[90vh] p-0"
            : "sm:max-w-[425px]"
        } bg-[#2A3A3A] text-gray-200 border-gray-600 rounded-lg`}
      >
        {step === "files" && renderFileSelection()}
        {step === "vscode" && renderVSCodeInterface()}
        {step === "loading" && renderLoadingState()}
      </DialogContent>
    </Dialog>
  );
};

export default ImportRepoModal;
