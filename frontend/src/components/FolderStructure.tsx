import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { FolderIcon, FileIcon, ChevronDown, ChevronRight } from "lucide-react";

const FolderStructure = ({
  isOpen,
  onClose,
  fileStructure = [],
  onFileSelect,
  selectedFile,
}) => {
  const [expandedFolders, setExpandedFolders] = useState({});

  const toggleFolder = (path) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [path]: !prev[path],
    }));
  };

  const renderTreeNode = (node, depth = 0) => {
    const isFolder = node.type === "directory";
    const isExpanded = expandedFolders[node.path];
    const isSelected = selectedFile === node.path;

    return (
      <div key={node.path} className="w-full">
        <div
          className={`flex items-center px-2 py-1 hover:bg-accent/50 rounded cursor-pointer ${
            isSelected ? "bg-accent text-accent-foreground" : ""
          }`}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
          onClick={() => {
            if (isFolder) {
              toggleFolder(node.path);
            } else {
              onFileSelect(node.path);
            }
          }}
        >
          {isFolder ? (
            <>
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 mr-1 shrink-0" />
              ) : (
                <ChevronRight className="h-4 w-4 mr-1 shrink-0" />
              )}
              <FolderIcon className="h-4 w-4 mr-2 text-yellow-500 shrink-0" />
            </>
          ) : (
            <>
              <span className="w-4 mr-1"></span>
              <FileIcon className="h-4 w-4 mr-2 text-blue-500 shrink-0" />
            </>
          )}
          <span className="truncate">{node.name}</span>
        </div>

        {isFolder && isExpanded && node.children && (
          <div>
            {node.children.map((childNode) =>
              renderTreeNode(childNode, depth + 1),
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md md:max-w-lg">
        <DialogHeader>
          <DialogTitle>Repository Structure</DialogTitle>
        </DialogHeader>
        <div className="my-2">
          <p className="text-sm text-muted-foreground mb-4">
            Browse the repository structure and select a file to generate
            documentation.
          </p>
          <ScrollArea className="h-80 w-full border rounded-md p-2">
            {fileStructure.length > 0 ? (
              fileStructure.map((node) => renderTreeNode(node))
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">No files found</p>
              </div>
            )}
          </ScrollArea>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => selectedFile && onFileSelect(selectedFile)}
            disabled={!selectedFile}
          >
            Select File
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FolderStructure;
