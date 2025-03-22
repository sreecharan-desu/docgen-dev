import React from "react";
import { Users } from "lucide-react";

const Collaborators = ({ collaborators }) => (
  <div>
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-sm font-semibold text-foreground">Collaborators</h3>
    </div>
    {collaborators.length > 0 ? (
      <div className="space-y-2">
        {collaborators.map((collaborator, index) => (
          <div
            key={index}
            className="p-3 bg-muted rounded-md border border-border flex items-center gap-2"
          >
            <Users className="h-4 w-4 text-primary" />
            <span className="text-sm text-foreground">
              {collaborator.email} ({collaborator.permission})
            </span>
          </div>
        ))}
      </div>
    ) : (
      <p className="text-sm text-muted-foreground italic">No collaborators yet</p>
    )}
  </div>
);

export default Collaborators;