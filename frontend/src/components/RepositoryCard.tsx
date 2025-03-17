import React from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FolderTree,
  FileText,
  Github,
  GitBranch,
  Calendar,
  Code,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const RepositoryCard = ({ repo, onViewStructure, onGenerateDoc }) => {
  const { id, name, url, type, source, updatedAt, fileCount } = repo;

  const getSourceIcon = () => {
    switch (source?.toLowerCase()) {
      case "github":
        return <Github className="h-4 w-4" />;
      default:
        return <Code className="h-4 w-4" />;
    }
  };

  const getTypeLabel = () => {
    switch (type?.toLowerCase()) {
      case "python":
        return "Python";
      case "javascript":
        return "JavaScript";
      case "typescript":
        return "TypeScript";
      case "java":
        return "Java";
      default:
        return "Repository";
    }
  };

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return "Unknown";
    try {
      const date = new Date(timestamp);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return "Unknown";
    }
  };

  const getTypeColor = () => {
    switch (type?.toLowerCase()) {
      case "python":
        return "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20";
      case "javascript":
        return "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20";
      case "typescript":
        return "bg-blue-600/10 text-blue-600 hover:bg-blue-600/20";
      case "java":
        return "bg-orange-500/10 text-orange-500 hover:bg-orange-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20";
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="flex items-center truncate">
            {getSourceIcon()}
            <span className="ml-2 truncate">{name}</span>
          </CardTitle>
          <Badge variant="outline" className={getTypeColor()}>
            {getTypeLabel()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="text-sm text-muted-foreground mb-3 truncate">{url}</div>

        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center text-xs text-muted-foreground">
            <Calendar className="h-3 w-3 mr-1" />
            {formatTimeAgo(updatedAt)}
          </div>
          <div className="flex items-center text-xs text-muted-foreground">
            <FileText className="h-3 w-3 mr-1" />
            {fileCount || 0} files
          </div>
          <div className="flex items-center text-xs text-muted-foreground">
            <GitBranch className="h-3 w-3 mr-1" />
            main
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-4">
        <Button variant="outline" size="sm" onClick={() => onViewStructure(id)}>
          <FolderTree className="h-4 w-4 mr-2" />
          Structure
        </Button>
        <Button size="sm" onClick={() => onGenerateDoc(id)}>
          <FileText className="h-4 w-4 mr-2" />
          Generate Doc
        </Button>
      </CardFooter>
    </Card>
  );
};

export default RepositoryCard;
