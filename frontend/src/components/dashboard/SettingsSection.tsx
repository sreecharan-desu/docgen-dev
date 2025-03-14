/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { User, Mail, CheckCircle, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";

interface SettingsSectionProps {
  user: any;
}

const SettingsSection = ({ user: initialUser }: SettingsSectionProps) => {
  const [user, setUser] = useState(initialUser);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formState, setFormState] = useState({
    name: initialUser?.name || "",
  });
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!formState.name.trim()) {
      toast({
        title: "Error",
        description: "Name cannot be empty",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // In a real app, you would make an API call like:
      // const response = await fetch('/api/user/update', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ name: formState.name }),
      // });
      // if (!response.ok) throw new Error('Failed to update profile');
      
      setUser((prev: any) => ({ ...prev, name: formState.name }));
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Your profile has been updated",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  const inputVariants = {
    idle: { scale: 1 },
    focus: { scale: 1.02, transition: { duration: 0.2 } }
  };

  const buttonVariants = {
    idle: { scale: 1 },
    hover: { scale: 1.05, transition: { duration: 0.2 } },
    tap: { scale: 0.95, transition: { duration: 0.1 } }
  };

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h1 className="text-3xl font-bold mb-2">Account Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences</p>
      </motion.div>
      
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <Card className="overflow-hidden border-0 shadow-lg">
          <motion.div 
            className="h-1 bg-gradient-to-r from-blue-400 to-purple-500"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          ></motion.div>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Update your account profile information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4 text-blue-500" />
                  Email
                </label>
                <motion.div 
                  className="relative group"
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.2 }}
                >
                  <input 
                    type="email" 
                    value={user?.email || ''} 
                    disabled 
                    className="w-full p-3 rounded-md border bg-muted/30 text-muted-foreground pl-4 transition-shadow shadow-sm"
                  />
                  <p className="text-xs text-muted-foreground mt-1 ml-1">Your email address cannot be changed</p>
                </motion.div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <User className="h-4 w-4 text-blue-500" />
                  Name
                </label>
                <motion.div 
                  className="relative"
                  variants={inputVariants}
                  initial="idle"
                  whileHover="focus"
                  whileFocus="focus"
                >
                  <input 
                    type="text" 
                    name="name"
                    value={formState.name} 
                    onChange={handleInputChange}
                    placeholder="Your name"
                    disabled={!isEditing}
                    className={`w-full p-3 rounded-md border transition-all duration-200 pl-4 ${
                      isEditing 
                        ? "bg-white shadow-md border-blue-300 focus:ring-2 focus:ring-blue-300 focus:border-blue-500" 
                        : "bg-muted/30 text-muted-foreground"
                    }`}
                  />
                  {isEditing && (
                    <motion.div 
                      className="absolute right-3 top-3 text-blue-500"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 15 }}
                    >
                      <CheckCircle className="h-5 w-5" />
                    </motion.div>
                  )}
                </motion.div>
              </div>
              
              <div className="flex gap-3 mt-6">
                {!isEditing ? (
                  <motion.div
                    variants={buttonVariants}
                    initial="idle"
                    whileHover="hover"
                    whileTap="tap"
                    className="w-full sm:w-auto"
                  >
                    <Button 
                      onClick={() => setIsEditing(true)}
                      className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                    >
                      Edit Profile
                    </Button>
                  </motion.div>
                ) : (
                  <div className="flex gap-3 w-full sm:w-auto">
                    <motion.div
                      variants={buttonVariants}
                      initial="idle"
                      whileHover="hover"
                      whileTap="tap"
                      className="flex-1 sm:flex-initial"
                    >
                      <Button 
                        onClick={handleSave}
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                      >
                        {isLoading ? "Saving..." : "Save Changes"}
                      </Button>
                    </motion.div>
                    
                    <motion.div
                      variants={buttonVariants}
                      initial="idle"
                      whileHover="hover"
                      whileTap="tap"
                      className="flex-1 sm:flex-initial"
                    >
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setIsEditing(false);
                          setFormState({ name: user?.name || "" });
                        }}
                        disabled={isLoading}
                        className="w-full border-gray-300"
                      >
                        Cancel
                      </Button>
                    </motion.div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default SettingsSection;