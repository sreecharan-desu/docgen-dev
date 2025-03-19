/* eslint-disable @typescript-eslint/no-unused-expressions */
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { FileText, CheckCircle } from "lucide-react";

const FileReadingAnimation = ({ isOpen, files = [], onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [processedFiles, setProcessedFiles] = useState([]);
  const totalFiles = files.length;

  useEffect(() => {
    if (!isOpen) {
      // Reset state when closed
      setProgress(0);
      setCurrentFileIndex(0);
      setProcessedFiles([]);
      return;
    }

    let currentIndex = 0;
    const processNextFile = () => {
      if (currentIndex >= totalFiles) {
        // All files processed
        setTimeout(() => {
          onComplete && onComplete();
        }, 1000);
        return;
      }

      const file = files[currentIndex];
      setCurrentFileIndex(currentIndex);

      // Simulate file processing with random duration
      const processingTime = Math.floor(Math.random() * 500) + 300;

      setTimeout(() => {
        setProcessedFiles((prev) => [...prev, file]);
        currentIndex++;
        setProgress(Math.floor((currentIndex / totalFiles) * 100));
        processNextFile();
      }, processingTime);
    };

    // Start the animation after a short delay
    const timer = setTimeout(() => {
      processNextFile();
    }, 500);

    return () => clearTimeout(timer);
  }, [isOpen, files, totalFiles, onComplete]);

  const getCurrentFileName = () => {
    if (currentFileIndex < totalFiles) {
      return files[currentFileIndex];
    }
    return "Completing analysis...";
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md">
        <div className="py-6">
          <div className="flex flex-col items-center justify-center space-y-6">
            <div className="text-center">
              <h3 className="font-semibold text-lg mb-2">
                Analyzing Repository
              </h3>
              <p className="text-muted-foreground mb-4">
                Reading files and generating comprehensive documentation...
              </p>
            </div>

            <Progress value={progress} className="w-full" />

            <div className="flex items-center justify-center w-full mt-2">
              <div className="text-sm">
                {progress < 100 ? (
                  <div className="flex items-center">
                    <FileText className="mr-2 h-4 w-4 animate-pulse text-primary" />
                    <span>Reading {getCurrentFileName()}</span>
                  </div>
                ) : (
                  <div className="flex items-center text-green-500">
                    <CheckCircle className="mr-2 h-4 w-4" />
                    <span>Processing complete</span>
                  </div>
                )}
              </div>
            </div>

            <div className="w-full max-h-32 overflow-y-auto text-xs border rounded-md p-2 bg-muted/50">
              {processedFiles.slice(-5).map((file, index) => (
                <div key={index} className="flex items-center py-1">
                  <CheckCircle className="mr-2 h-3 w-3 text-green-500" />
                  <span className="truncate">{file}</span>
                </div>
              ))}
              {progress === 100 && (
                <div className="flex items-center py-1 text-primary font-medium">
                  <CheckCircle className="mr-2 h-3 w-3 text-green-500" />
                  <span>Generating documentation...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FileReadingAnimation;
