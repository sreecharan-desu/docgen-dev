import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Key, Trash, Eye, EyeOff, Copy, Loader2, User } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { ToastIcon } from "@/components/ui/toast";
import { useApiKeys } from "@/hooks/useApiKeys";
import { motion, AnimatePresence } from "framer-motion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ApiKey {
  id: string;
  key: string;
  created_at: string;
  plan: string;
}

interface ApiKeysSectionProps {
  user: any;
}

const ApiKeysSection = ({ user }: ApiKeysSectionProps) => {
  const { 
    apiKeys = [], 
    isLoading, 
    createApiKey, 
    deleteApiKey, 
    isCreating, 
    isDeleting,
    error
  } = useApiKeys();
  const [maskedKeys, setMaskedKeys] = useState<Record<string, boolean>>({});
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(true);
  const { toast } = useToast();

  // Toggle key visibility
  const toggleKeyVisibility = (keyId: string) => {
    setMaskedKeys(prev => ({
      ...prev,
      [keyId]: !prev[keyId]
    }));
  };

  // Mask API key for security
  const maskApiKey = (key: string) => {
    return `${key.slice(0, 8)}${'•'.repeat(24)}${key.slice(-8)}`;
  };

  // Copy to clipboard with enhanced feedback
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        variant: "success",
        title: "Copied to clipboard",
        description: (
          <div className="flex items-center gap-2">
            <ToastIcon variant="success" />
            <span>API key copied successfully</span>
          </div>
        ),
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: (
          <div className="flex items-center gap-2">
            <ToastIcon variant="destructive" />
            <span>Failed to copy API key</span>
          </div>
        ),
      });
    }
  };

  const handleCreateKey = () => {
    if (typeof createApiKey === 'function') {
      createApiKey();
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Unable to create API key. The function is not available.",
      });
    }
  };

  const handleDeleteKey = (id: string) => {
    if (typeof deleteApiKey === 'function') {
      setDeletingId(id);
      deleteApiKey(id)
        .then(() => {
          toast({
            variant: "success",
            title: "API Key Deleted",
            description: "The API key has been successfully deleted.",
          });
        })
        .catch((err) => {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to delete API key. Please try again.",
          });
        })
        .finally(() => {
          setDeletingId(null);
        });
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Unable to delete API key. The function is not available.",
      });
    }
  };

  // Dismiss welcome message
  const dismissWelcomeMessage = () => {
    setShowWelcomeMessage(false);
  };

  // Show error state if there's an error
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 mt-20">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="border-destructive/50 overflow-hidden">
              <div className="h-1 bg-destructive/70 w-full" />
              <CardContent className="flex flex-col items-center justify-center py-12">
                <motion.div 
                  className="rounded-full bg-destructive/10 p-3 mb-4"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                >
                  <AlertCircle className="h-6 w-6 text-destructive" />
                </motion.div>
                <h3 className="text-lg font-semibold mb-2">Error Loading API Keys</h3>
                <p className="text-muted-foreground text-center mb-4">
                  {error.message || "There was a problem loading your API keys. Please try again."}
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => window.location.reload()}
                  className="transition-all duration-300 hover:border-destructive hover:bg-destructive/5"
                >
                  <motion.div
                    whileHover={{ rotate: 180 }}
                    transition={{ duration: 0.5 }}
                    className="mr-2"
                  >
                    <Loader2 className="h-4 w-4" />
                  </motion.div>
                  Retry
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  // Enhanced loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 mt-20">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="border-border/40 overflow-hidden">
              <div className="h-1 bg-primary/20 w-full relative">
                <motion.div 
                  className="h-full bg-gradient-to-r from-primary/40 via-primary to-primary/40"
                  initial={{ x: "-100%" }}
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ 
                    duration: 1.5, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                />
              </div>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <motion.div
                  className="relative"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  {/* Pulsing circle behind the loader */}
                  <motion.div 
                    className="absolute inset-0 rounded-full bg-primary/10"
                    animate={{ 
                      scale: [1, 1.2, 1],
                      opacity: [0.7, 0.2, 0.7]
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity,
                      ease: "easeInOut" 
                    }}
                  />
                  
                  {/* Rotating dots around the circle */}
                  <div className="relative h-16 w-16 flex items-center justify-center">
                    {[...Array(8)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute h-2 w-2 rounded-full bg-primary"
                        initial={{ 
                          x: 0, 
                          y: 0,
                          opacity: 0 
                        }}
                        animate={{ 
                          x: Math.cos(i * (Math.PI / 4)) * 24,
                          y: Math.sin(i * (Math.PI / 4)) * 24,
                          opacity: [0.2, 1, 0.2],
                          scale: [0.8, 1, 0.8]
                        }}
                        transition={{ 
                          duration: 2,
                          repeat: Infinity,
                          delay: i * 0.15,
                          ease: "easeInOut"
                        }}
                      />
                    ))}
                    
                    {/* Center icon */}
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    >
                      <Key className="h-8 w-8 text-primary" />
                    </motion.div>
                  </div>
                </motion.div>
                
                <motion.div 
                  className="mt-8 space-y-2 text-center"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  <p className="text-lg font-medium">Loading your dashboard</p>
                  <p className="text-muted-foreground text-sm">
                    Preparing your API keys and account information...
                  </p>
                  
                  {/* Loading progress text */}
                  <motion.p
                    className="text-xs text-primary/80 mt-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    Connecting to server
                  </motion.p>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showWelcomeMessage && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="relative"
        >
          <Card className="bg-primary/5 border-primary/20 mb-6 overflow-hidden">
            <div className="absolute top-0 right-0 p-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 w-7 p-0 rounded-full" 
                onClick={dismissWelcomeMessage}
              >
                <span className="sr-only">Close</span>
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
                  <path d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                </svg>
              </Button>
            </div>
            <CardContent className="pt-6 pb-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="rounded-full bg-primary/10 p-3">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-1">Welcome, {user?.name || 'User'}!</h3>
                  <p className="text-muted-foreground">
                    This is your API keys dashboard. Create your first API key to get started with DocGen services.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">API Keys</h1>
          <p className="text-muted-foreground">Manage your API keys for accessing DocGen services</p>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                onClick={handleCreateKey} 
                disabled={isCreating}
                className="transition-all duration-300 hover:shadow-md relative overflow-hidden group"
              >
                <span className="absolute inset-0 w-full h-full bg-primary/10 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></span>
                <span className="relative flex items-center">
                  {isCreating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      New Key
                    </>
                  )}
                </span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Create a new API key for your applications</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <AnimatePresence mode="wait">
        <motion.div 
          className="space-y-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          {!Array.isArray(apiKeys) || apiKeys.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <motion.div 
                  className="rounded-full bg-primary/10 p-3 mb-4"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <Key className="h-6 w-6 text-primary" />
                </motion.div>
                <h3 className="text-lg font-semibold mb-2">No API Keys</h3>
                <p className="text-muted-foreground text-center mb-4 max-w-md">
                  You haven't created any API keys yet. Create one to get started with DocGen services.
                </p>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    variant="outline" 
                    onClick={handleCreateKey} 
                    disabled={isCreating}
                    className="transition-all duration-300 hover:border-primary hover:bg-primary/5 group"
                  >
                    {isCreating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                        Create your first API key
                      </>
                    )}
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {apiKeys.map((apiKey, index) => (
                <motion.div
                  key={apiKey.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2, delay: index * 0.1 }}
                  layout
                  className="group"
                >
                  <Card className="hover:shadow-md transition-all duration-300 border-border/60 hover:border-border overflow-hidden">
                    <div className="h-1 bg-primary/0 group-hover:bg-primary/30 transition-colors duration-300"></div>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                      <div className="flex items-center space-x-2">
                        <div className="rounded-full bg-primary/10 p-2 group-hover:bg-primary/20 transition-colors duration-300">
                          <Key className="h-4 w-4 text-primary" />
                        </div>
                        <CardTitle className="text-lg font-semibold">API Key</CardTitle>
                      </div>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive/70 hover:bg-destructive/10 hover:text-destructive transition-colors duration-200"
                              onClick={() => handleDeleteKey(apiKey.id)}
                              disabled={deletingId === apiKey.id}
                            >
                              {deletingId === apiKey.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash className="h-4 w-4" />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Delete this API key</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="relative">
                        <div className="bg-background border rounded-lg p-4 font-mono text-sm break-all flex items-center justify-between group/key">
                          <div className="flex-1 mr-2 select-all">
                            {maskedKeys[apiKey.id] ? apiKey.key : maskApiKey(apiKey.key)}
                          </div>
                          <div className="flex items-center gap-2">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-muted-foreground hover:text-foreground transition-colors duration-200"
                                    onClick={() => toggleKeyVisibility(apiKey.id)}
                                  >
                                    {maskedKeys[apiKey.id] ? (
                                      <EyeOff className="h-4 w-4" />
                                    ) : (
                                      <Eye className="h-4 w-4" />
                                    )}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{maskedKeys[apiKey.id] ? "Hide API key" : "Show API key"}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-muted-foreground hover:text-foreground transition-colors duration-200"
                                    onClick={() => copyToClipboard(apiKey.key)}
                                  >
                                    <Copy className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Copy to clipboard</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-sm gap-3">
                        <div className="flex flex-wrap items-center gap-4">
                          <div>
                            <p className="text-muted-foreground">Created</p>
                            <p className="font-medium">
                              {new Date(apiKey.created_at).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Plan</p>
                            <div className="font-medium capitalize">
                              <motion.span 
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary"
                                whileHover={{ scale: 1.05 }}
                                transition={{ duration: 0.2 }}
                              >
                                {apiKey.plan}
                              </motion.span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default ApiKeysSection; 