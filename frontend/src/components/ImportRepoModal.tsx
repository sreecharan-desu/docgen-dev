/* eslint-disable @typescript-eslint/no-unused-expressions */
import React, { useState, useRef, useCallback } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { FileUp, FolderGit2, FileText, Folder, X, GitBranch, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";

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
  // Simulate network delay of 2 seconds
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
      setStep("loading"); // Transition to loading state
      // Simulate file processing delay of 1.5 seconds
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
    setStep("loading"); // Transition to loading state
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
      setStep("vscode"); // Revert to previous step on error
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
      <ScrollArea className="h-[calc(100vh-200px)] w-[300px] border-r border-gray-800 bg-black text-gray-100">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="p-2">
          <div className="flex items-center justify-between p-2 bg-gray-850 text-gray-400">
            <span className="text-xs uppercase tracking-wider">Explorer</span>
          </div>
          {Object.entries(groupedFiles).map(([dir, dirFiles]) => (
            <motion.div
              key={dir}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="ml-2"
            >
              <div className="flex items-center gap-1 py-1">
                <Folder className="h-4 w-4 text-blue-500" />
                <span className="text-sm truncate font-medium text-gray-100">{dir || selectedFolder}</span>
              </div>
              <div className="ml-4">
                {dirFiles.map((file, index) => (
                  <motion.div
                    key={index}
                    initial={{ x: 10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className="flex items-center gap-1 py-1"
                  >
                    <FileText className="h-4 w-4 text-gray-400" />
                    <span className="text-sm truncate text-gray-300">{file.name}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </ScrollArea>
    );
  };

  const renderLoadingState = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center h-[calc(100vh-200px)] w-full bg-gray-900 rounded-lg p-6"
    >
      <motion.div
        animate={{
          rotate: 360,
          scale: [1, 1.2, 1],
        }}
        transition={{
          rotate: { duration: 1.5, repeat: Infinity, ease: "linear" },
          scale: { duration: 0.8, repeat: Infinity, ease: "easeInOut" },
        }}
        className="relative"
      >
        <Loader2 className="h-16 w-16 text-blue-500" />
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <GitBranch className="h-8 w-8 text-blue-400" />
        </motion.div>
      </motion.div>
      <motion.h2
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-xl font-semibold text-white mt-6"
      >
        {isSubmitting ? "Importing Repository..." : "Processing Files..."}
      </motion.h2>
      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="text-sm text-gray-400 mt-2"
      >
        {isSubmitting ? "Adding to project..." : "Analyzing folder structure..."}
      </motion.p>
    </motion.div>
  );

  const renderVSCodeInterface = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="flex h-[calc(100vh-100px)] w-full bg-gray-900 rounded-lg overflow-hidden shadow-lg border border-gray-800"
    >
      {renderFileExplorer()}
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between p-2 bg-gray-850 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <span className="text-sm font-medium text-gray-100">{repoName} - VS Code</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSelection}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-white hover:bg-gray-700"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1 p-6 bg-gray-900 text-gray-100 flex items-center justify-center">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="text-center"
          >
            <h2 className="text-xl font-semibold text-white mb-4">Repository: {repoName}</h2>
            <p className="text-sm text-gray-400 mb-6">
              {files.length} files ready for import from "{selectedFolder}"
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={handleImport}
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Importing...
                  </span>
                ) : (
                  "Import Local Repository"
                )}
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );

  const renderFancyInitialPopup = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="p-6 bg-gray-850 rounded-lg shadow-lg border border-gray-800"
    >
      <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-700">
        <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
          <GitBranch className="h-16 w-16 text-blue-500" />
        </motion.div>
        <h3 className="text-2xl font-semibold text-white mb-3 tracking-tight">Name Your Repository</h3>
        <p className="text-sm text-gray-400 mb-6 text-center max-w-xs">
          Provide a unique name to begin importing your repository
        </p>
        <div className="w-full max-w-md space-y-4">
          <div className="space-y-2">
            <Label htmlFor="repoName" className="text-gray-100 font-medium">
              Repository Name
            </Label>
            <Input
              id="repoName"
              value={repoName}
              onChange={(e) => setRepoName(e.target.value)}
              placeholder="e.g., MyAwesomeProject"
              className="bg-gray-900 border-gray-700 text-gray-100 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500 rounded-md"
            />
          </div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button onClick={handleNextStep} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              Next
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );

  const renderFileSelection = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="p-6 bg-gray-850 rounded-lg shadow-lg border border-gray-800"
    >
      <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-700">
        <FolderGit2 className="h-10 w-10 text-blue-500" />
        <h3 className="text-base font-semibold text-white mb-2">Select Repository Files for "{repoName}"</h3>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={handleFileUpload}
            variant="secondary"
            disabled={isSubmitting}
            className="bg-gray-700 text-gray-100 hover:bg-gray-600 py-2 px-4 rounded-md"
          >
            <FileUp className="mr-2 h-4 w-4" />
            Select Folder
          </Button>
        </motion.div>
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
    </motion.div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleModalClose}>
      <DialogContent
        className={`${step === "vscode" || step === "loading" ? "max-w-[90vw] max-h-[90vh] p-0" : "sm:max-w-[425px]"} bg-gray-850 text-gray-100 border-gray-800 rounded-lg`}
      >
        <AnimatePresence mode="wait">
          {step === "name" && <motion.div key="name">{renderFancyInitialPopup()}</motion.div>}
          {step === "files" && <motion.div key="files">{renderFileSelection()}</motion.div>}
          {step === "vscode" && <motion.div key="vscode">{renderVSCodeInterface()}</motion.div>}
          {step === "loading" && <motion.div key="loading">{renderLoadingState()}</motion.div>}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default ImportRepoModal;