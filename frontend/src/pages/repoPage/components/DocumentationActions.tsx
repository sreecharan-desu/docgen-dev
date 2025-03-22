import React from "react";
import { FileText, RefreshCw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

const DocumentationActions = ({ isGeneratingDocs, errors, hasDocs, onGenerate }) => (
  <div className="mt-6 flex flex-col items-center justify-center min-h-[150px]">
    {!isGeneratingDocs && (
      <div className="flex flex-col items-center gap-4 w-full max-w-md">
        {errors && (
          <Alert variant="destructive" className="w-full">
            <AlertDescription className="flex items-center justify-between">
              <span>{errors}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={onGenerate}
                className="ml-4 bg-background hover:bg-muted text-foreground border-primary hover:border-primary/80 transition-colors"
              >
                <RefreshCw className="h-4 w-4 mr-2 animate-spin-hover" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}
        <Button onClick={onGenerate} className="w-full flex items-center justify-center gap-2">
          <FileText className="h-4 w-4" />
          {hasDocs ? "Regenerate Docs" : "Generate Docs"}
        </Button>
      </div>
    )}
  </div>
);

export default DocumentationActions;