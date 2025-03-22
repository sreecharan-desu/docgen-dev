import { Button } from "@/components/ui/button";
import {
  FileText,
  Download,
  Clock,
  CheckCircle,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

const DocumentationSection = ({ documentation, onPreview, onDownload }) => {
  // Format the timestamp
  const formatDate = (timestamp) => {
    if (!timestamp) return "Unknown date";

    const date = new Date(timestamp);
    return new Intl.DateTimeFormat("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <FileText className="mr-2 h-5 w-5 text-primary" />
        Documentation
      </h2>
      <Separator className="mb-6" />

      <div className="bg-card rounded-lg border border-border shadow-sm">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              <h3 className="font-medium text-lg">
                {documentation.title || "Project Documentation"}
              </h3>
            </div>
            <div className="flex items-center text-muted-foreground text-sm">
              <Clock className="h-4 w-4 mr-1" />
              <span>Generated on {formatDate(documentation.timestamp)}</span>
            </div>
          </div>

          <p className="text-muted-foreground mb-6">
            {documentation.description ||
              "Comprehensive documentation generated from your repository code."}
          </p>

          <div className="flex flex-wrap gap-4">
            <Button
              onClick={onPreview}
              variant="default"
              className="flex items-center"
            >
              <FileText className="mr-2 h-4 w-4" />
              Preview Documentation
            </Button>

            <Button
              onClick={onDownload}
              variant="outline"
              className="flex items-center"
            >
              <Download className="mr-2 h-4 w-4" />
              Download as Markdown
            </Button>
          </div>
        </div>

        {documentation.sections && documentation.sections.length > 0 && (
          <div className="border-t border-border p-6">
            <h4 className="font-medium mb-4">Documentation Sections</h4>
            <ul className="space-y-2">
              {documentation.sections.map((section, index) => (
                <li key={index} className="flex items-center">
                  <span className="w-6 h-6 flex items-center justify-center rounded-full bg-primary/10 text-primary text-xs mr-3">
                    {index + 1}
                  </span>
                  <span>{section.title}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentationSection;
