import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Download, Copy, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { motion } from "framer-motion";

const MdPreview = ({ isOpen, onClose, content = "", onDownload }) => {
  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success("Copied to clipboard");
    } catch (error) {
      toast.error("Failed to copy to clipboard");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl h-[80vh] p-0 bg-gray-900 text-gray-100 border border-gray-800 rounded-lg overflow-hidden">
        <div className="flex flex-col h-full">
          {/* VS Code-style Header */}
          <div className="flex items-center justify-between p-2 bg-gray-850 border-b border-gray-800">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
            <span className="text-sm font-medium text-gray-100">
              Documentation Preview - VS Code
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-white hover:bg-gray-700"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Main Content */}
          <div className="flex flex-1 overflow-hidden">
            {/* Raw Markdown View */}
            <div className="w-1/2 border-r border-gray-800">
              <div className="p-2 bg-gray-850 text-gray-400 text-xs font-medium">
                Raw Markdown
              </div>
              <ScrollArea className="h-full p-4 bg-gray-900">
                <motion.pre
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="font-mono text-sm text-gray-300 whitespace-pre-wrap"
                >
                  {content}
                </motion.pre>
              </ScrollArea>
            </div>

            {/* Rendered Preview */}
            <div className="w-1/2">
              <div className="p-2 bg-gray-850 text-gray-400 text-xs font-medium">
                Rendered Preview
              </div>
              <ScrollArea className="h-full p-4 bg-gray-900">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="prose prose-sm max-w-none text-gray-100"
                >
                  <ReactMarkdown>{content}</ReactMarkdown>
                </motion.div>
              </ScrollArea>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 p-4 border-t border-gray-800 bg-gray-850">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyToClipboard}
                className="border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white"
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy to Clipboard
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={onDownload}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </motion.div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MdPreview;
