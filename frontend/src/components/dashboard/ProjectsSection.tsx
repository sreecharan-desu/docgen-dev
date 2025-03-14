import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, FolderKanban } from "lucide-react";
import { motion } from "framer-motion";

const ProjectsSection = () => {
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Projects</h1>
        <p className="text-muted-foreground">Manage your DocGen projects</p>
      </div>
      
      <Card className="overflow-hidden">
        <div className="h-1 bg-primary/20"></div>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <motion.div 
            className="rounded-full bg-primary/10 p-3 mb-4"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <FolderKanban className="h-6 w-6 text-primary" />
          </motion.div>
          <h3 className="text-lg font-semibold mb-2">Projects</h3>
          <p className="text-muted-foreground text-center mb-4">
            This feature is coming soon. You'll be able to create and manage your projects here.
          </p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button variant="outline" disabled className="opacity-70">
              <Plus className="h-4 w-4 mr-2" />
              Create Project
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectsSection; 