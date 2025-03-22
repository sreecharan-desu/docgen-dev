import React from "react";
import { formatDate } from "@/utils/functions";

const RepositoryDetails = ({ repo, selectedFile }) => (
  <div>
    <h2 className="text-lg font-semibold text-foreground mb-4">Repository Details</h2>
    <p className="text-sm text-muted-foreground">Source: {repo.source || "N/A"}</p>
    <p className="text-sm text-muted-foreground">URL: {repo.repo_url || "N/A"}</p>
    <p className="text-sm text-muted-foreground">
      Files: {repo.files?.length || 0} | Created: {formatDate(repo.created_at)} | Updated:{" "}
      {formatDate(repo.updatedAt)}
    </p>
    {selectedFile && (
      <div className="bg-muted p-4 rounded-md mt-4">
        <h3 className="text-sm font-semibold mb-2">Selected File: {selectedFile}</h3>
        <p className="text-sm text-muted-foreground">Click another file to view its details</p>
      </div>
    )}
  </div>
);

export default RepositoryDetails;