import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { User, Mail } from "lucide-react";
import { motion } from "framer-motion";

interface SettingsSectionProps {
  user: any;
}

const SettingsSection = ({ user }: SettingsSectionProps) => {
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Account Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences</p>
      </div>
      
      <Card className="overflow-hidden">
        <div className="h-1 bg-primary/20"></div>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Update your account profile information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <div className="relative group">
                <input 
                  type="email" 
                  value={user?.email || ''} 
                  disabled 
                  className="w-full p-2 rounded-md border bg-muted/50 text-muted-foreground pl-10"
                />
                <Mail className="h-4 w-4 absolute left-3 top-2.5 text-muted-foreground" />
                <p className="text-xs text-muted-foreground mt-1">Your email address cannot be changed</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <div className="relative group">
                <input 
                  type="text" 
                  value={user?.name || ''} 
                  placeholder="Your name"
                  disabled
                  className="w-full p-2 rounded-md border bg-muted/50 text-muted-foreground pl-10"
                />
                <User className="h-4 w-4 absolute left-3 top-2.5 text-muted-foreground" />
              </div>
            </div>
            
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="mt-4"
            >
              <Button disabled className="opacity-70 w-full sm:w-auto">
                Save Changes
              </Button>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsSection; 