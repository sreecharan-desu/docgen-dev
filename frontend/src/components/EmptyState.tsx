import { Button } from "@/components/ui/button";
import { FolderGit2, Github } from "lucide-react";

const EmptyState = ({ onImportRepo }) => {
  return (
    <div className="border border-dashed border-border rounded-lg p-8 flex flex-col items-center justify-center text-center bg-muted/30">
      <div className="rounded-full bg-primary/10 p-4 mb-4">
        <FolderGit2 className="h-8 w-8 text-primary" />
      </div>

      <h3 className="text-lg font-medium mb-2">No repositories yet</h3>
      <p className="text-muted-foreground mb-6 max-w-md">
        Import your first repository to start generating documentation. You can
        upload your own files.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          onClick={onImportRepo}
          className="flex items-center"
          variant="outline"
        >
          <FolderGit2 className="mr-2 h-4 w-4" />
          Upload Local Files
        </Button>
      </div>
    </div>
  );
};

export default EmptyState;
