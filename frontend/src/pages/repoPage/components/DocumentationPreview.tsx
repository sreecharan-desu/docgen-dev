import React, { memo, useState, useCallback } from "react";
import { Copy, Download } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

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
                  className={`px-3 py-1 text-sm rounded-md ${
                    activeTab === "preview" ? "bg-background text-foreground" : "text-muted-foreground hover:bg-background"
                  }`}
                >
                  Preview
                </button>
                <button
                  onClick={() => setActiveTab("raw")}
                  className={`px-3 py-1 text-sm rounded-md ${
                    activeTab === "raw" ? "bg-background text-foreground" : "text-muted-foreground hover:bg-background"
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

export default DocumentationPreview;