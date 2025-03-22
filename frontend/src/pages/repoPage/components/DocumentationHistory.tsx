import React from "react";
import { Clock } from "lucide-react";
import { formatDate } from "@/utils/functions";

const DocumentationHistory = ({ history, setDocumentation }) => (
  history?.length > 0 && (
    <div>
      <h3 className="text-sm font-semibold text-foreground mb-3">Documentation Versions</h3>
      {history.map((doc, index) => {
        const version = `V_${history.length - index}.0`;
        return (
          <div
            key={index}
            className="p-3 bg-muted rounded-md border border-border mb-2 cursor-pointer hover:bg-muted/80 transition-colors duration-200"
            onClick={() => setDocumentation({ content: doc.content, repoId: state.repo.id })}
          >
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">{version}</span>
              <span className="text-xs text-muted-foreground">{formatDate(doc.timestamp)}</span>
            </div>
          </div>
        );
      })}
    </div>
  )
);

export default DocumentationHistory;