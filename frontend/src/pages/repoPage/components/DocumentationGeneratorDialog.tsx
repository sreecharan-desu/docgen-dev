import React, { memo, useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const DocumentationGeneratorDialog = memo(({ open, onOpenChange }) => {
  const [progressWidth, setProgressWidth] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const steps = [
    "Reading file contents...",
    "Cleaning data...",
    "Chunking data...",
    "Giving to AI...",
    "Formatting output...",
  ];

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgressWidth((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 1;
      });
    }, 100);

    const statusInterval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length);
    }, 2000);

    return () => {
      clearInterval(progressInterval);
      clearInterval(statusInterval);
    };
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-zinc-900 text-white p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-green-400">{">"}</span>
          <span className="text-white font-medium">Generating Documentation</span>
        </div>
        <div className="flex items-center mb-6 bg-zinc-700 rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-green-400 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progressWidth}%` }}
          ></div>
        </div>
        <div className="bg-zinc-800 rounded-md p-4 mb-4">
          <div className="flex items-center mb-6 text-green-400 text-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            README.md
          </div>
          <div className="space-y-4">
            <div className="bg-zinc-700/30 h-3 rounded w-full"></div>
            <div className="bg-zinc-700/30 h-3 rounded w-5/6"></div>
            <div className="bg-zinc-700/30 h-3 rounded w-4/6"></div>
            <div className="flex items-center justify-center py-3 text-zinc-500 text-sm font-mono">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 9l4-4 4 4m0 6l-4 4-4-4"
                />
              </svg>
              <span className="min-w-32 text-center transition-opacity duration-300 ease-in-out">
                {steps[currentStep]}
              </span>
              <span className="ml-1 animate-blink">|</span>
            </div>
            <div className="bg-zinc-700/30 h-3 rounded w-5/6"></div>
            <div className="bg-zinc-700/30 h-3 rounded w-full"></div>
            <div className="bg-zinc-700/30 h-3 rounded w-3/6"></div>
          </div>
        </div>
        <div className="text-zinc-500 text-xs">
          Processed {Math.min(Math.floor(progressWidth / 20) + 1, 6)} of 6 files
        </div>
      </DialogContent>
    </Dialog>
  );
});

export default DocumentationGeneratorDialog;