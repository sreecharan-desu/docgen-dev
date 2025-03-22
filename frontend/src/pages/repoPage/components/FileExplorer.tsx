import React, { memo } from "react";
import { ChevronLeft, ChevronRight, Folder, File, Upload } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { buildFileTree } from "../utils/fileTree";

const FileExplorer = memo(({ files, repoSource, onUploadClick, onFileSelect, expandedFolders, toggleFolder }) => {
  const fileTree = buildFileTree(files || []);

  const renderTree = (node, path = "root") => (
    <div className={node.name !== "root" ? "ml-4" : ""}>
      {node.isFolder ? (
        <div>
          <div className="flex items-center gap-2 py-2 text-sm text-muted-foreground hover:bg-muted rounded-md transition-colors duration-200 cursor-pointer">
            <button onClick={() => toggleFolder(path)} className="flex items-center gap-1 flex-1">
              {expandedFolders.has(path) ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
              <Folder className="h-4 w-4 text-primary" />
              <span className="truncate">{node.name}</span>
            </button>
          </div>
          {expandedFolders.has(path) && (
            <div>{node.children.map((child) => renderTree(child, `${path}/${child.name}`))}</div>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-2 py-2 text-sm rounded-md transition-colors duration-200">
          <div
            className={`flex items-center gap-2 flex-1 cursor-pointer ${
              selectedFile === path ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted"
            }`}
            onClick={() => onFileSelect(path)}
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
        {repoSource === "local" && (
          <Button variant="ghost" size="sm" onClick={onUploadClick}>
            <Upload className="h-4 w-4" />
          </Button>
        )}
      </div>
      <ScrollArea className="h-[calc(100vh-200px)]">
        <div className="p-4">
          {files?.length > 0 ? (
            renderTree(fileTree)
          ) : (
            <p className="text-sm text-muted-foreground italic">No files available</p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
});

export default FileExplorer;