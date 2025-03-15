/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { User as UserIcon, Mail, CheckCircle, AlertCircle, Shield, Settings, Save, Calendar, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import { UPDATE_USER_DETAILS_API } from "@/utils/apis";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";

interface User {
  email_confirmed: boolean
  created_at: any
  id: string
  email: string
  name?: string
  avatarUrl?: string
}

interface SettingsSectionProps {
  user?: User;
}

const SettingsSection = ({ user: propUser }: SettingsSectionProps) => {
  const { user: authUser } = useAuth();
  const initialUser = propUser || authUser;

  const [user, setUser] = useState<User | null>(initialUser || null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formState, setFormState] = useState({
    name: initialUser?.name || "",
  });
  const { toast } = useToast();

  // Update user if auth changes
  useEffect(() => {
    if (authUser && (!user || user.id !== authUser.id)) {
      setUser(authUser);
      setFormState({ name: authUser?.name || "" });
    }
  }, [authUser, user]);

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

      const response = await fetch(UPDATE_USER_DETAILS_API, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formState.name }),
      });
      if (!response.ok) throw new Error('Failed to update profile');

      setUser((prev) => prev ? { ...prev, name: formState.name } : null);
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Your profile has been updated",
        // icon: <CheckCircle className="h-5 w-5 text-emerald-400" />,
        className: "bg-slate-800 border border-emerald-500/20 shadow-lg shadow-emerald-500/10",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        // icon: <AlertCircle className="h-5 w-5 text-rose-400" />,
        className: "bg-slate-800 border border-rose-500/20 shadow-lg shadow-rose-500/10",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, type: "spring", stiffness: 150 },
    },
  };

  const inputVariants = {
    idle: { scale: 1 },
    focus: { scale: 1.02, boxShadow: "0 0 12px rgba(56, 189, 248, 0.4)", transition: { duration: 0.2 } },
  };

  const buttonVariants = {
    idle: { scale: 1 },
    hover: { scale: 1.04, transition: { duration: 0.15 } },
    tap: { scale: 0.95, transition: { duration: 0.1 } },
  };

  const glowVariants = {
    initial: { opacity: 0.4 },
    animate: {
      opacity: [0.4, 0.7, 0.4],
      transition: { duration: 3, repeat: Infinity, ease: "easeInOut" },
    },
  };

  const formatDate = (dateString: any) => {
    try {
      const date = new Date(dateString);
      return format(date, "MMMM dd, yyyy");
    } catch (error) {
      return "N/A";
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen text-slate-300">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <Settings className="h-12 w-12 mb-4 mx-auto text-blue-400 opacity-70" />
          <h2 className="text-xl font-medium">Loading user information...</h2>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-8 max-w-4xl mx-auto p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <motion.div
        className="mb-12 relative"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }}
      >
        <motion.div
          className="absolute -left-8 -top-8 w-24 h-24 rounded-full bg-blue-500/10 blur-xl"
          variants={glowVariants}
          initial="initial"
          animate="animate"
        />
        <motion.div
          className="absolute -right-12 -bottom-12 w-32 h-32 rounded-full bg-purple-500/10 blur-xl"
          variants={glowVariants}
          initial="initial"
          animate="animate"
          transition={{ delay: 1 }}
        />

        <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-cyan-400 to-purple-400 text-transparent bg-clip-text flex items-center gap-2">
          <Settings className="h-8 w-8 text-blue-400" />
          Account Settings
        </h1>
        <p className="text-slate-400 text-lg">Manage your account settings and preferences</p>
      </motion.div>

      {/* User Avatar section */}
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="relative"
        transition={{ delay: 0.2 }}
      >
        <motion.div
          className="absolute -inset-0.5 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-xl blur-sm opacity-50"
          animate={{
            opacity: [0.5, 0.7, 0.5],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />

        <Card className="overflow-hidden border-0 shadow-2xl relative bg-slate-800/90 backdrop-blur-sm">
          <motion.div
            className="h-1.5 bg-gradient-to-r from-blue-400 via-cyan-500 to-blue-500"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          />
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-bold text-slate-100 flex items-center gap-2">
              <UserIcon className="h-5 w-5 text-blue-400" />
              Avatar & Identity
            </CardTitle>
            <CardDescription className="text-slate-400">Your profile picture and account information</CardDescription>
          </CardHeader>
          <CardContent className="pb-8">
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <motion.div
                className="relative"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <motion.div
                  className="absolute -inset-1 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full blur-md"
                  animate={{
                    opacity: [0.5, 0.8, 0.5],
                    rotate: [0, 360]
                  }}
                  transition={{
                    opacity: { duration: 4, repeat: Infinity, repeatType: "reverse" },
                    rotate: { duration: 20, repeat: Infinity, ease: "linear" }
                  }}
                />
                <div className="h-32 w-32 rounded-full relative bg-slate-900 border-2 border-slate-700 overflow-hidden">
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.name || "User"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-900">
                      {user?.name ? (
                        <span className="h-16 w-16 flex items-center justify-center text-2xl font-semibold text-slate-300 bg-slate-800 rounded-full">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      ) : (
                        <UserIcon className="h-16 w-16 text-slate-500" />
                      )}
                    </div>

                  )}
                </div>
              </motion.div>

              <div className="space-y-3 flex-1">
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-wider text-slate-500">User ID</p>
                  <p className="text-slate-300 font-mono text-sm bg-slate-900/50 p-2 rounded border border-slate-700/50 overflow-x-auto">
                    {user.id}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Member Since
                  </p>
                  <p className="text-slate-300 text-sm">
                    {formatDate(user.created_at)}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-wider text-slate-500">Email Status</p>
                  <div className="flex items-center gap-1">
                    {user.email_confirmed ? (
                      <motion.div
                        className="bg-emerald-500/20 text-emerald-400 rounded-full px-2 py-1 text-xs flex items-center gap-1"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <CheckCircle className="h-3 w-3" /> Verified
                      </motion.div>
                    ) : (
                      <motion.div
                        className="bg-amber-500/20 text-amber-400 rounded-full px-2 py-1 text-xs flex items-center gap-1"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <AlertCircle className="h-3 w-3" /> Pending Verification
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Profile Information section */}
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="relative"
        transition={{ delay: 0.4 }}
      >
        <motion.div
          className="absolute -inset-0.5 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-xl blur-sm opacity-50"
          animate={{
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />

        <Card className="overflow-hidden border-0 shadow-2xl relative bg-slate-800/90 backdrop-blur-sm">
          <motion.div
            className="h-1.5 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          />
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-bold text-slate-100 flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-400" />
              Profile Information
            </CardTitle>
            <CardDescription className="text-slate-400">Update your account profile information</CardDescription>
          </CardHeader>
          <CardContent className="pb-8">
            <div className="space-y-8">
              <div className="space-y-3">
                <label className="text-sm font-medium flex items-center gap-2 text-slate-300">
                  <Mail className="h-4 w-4 text-cyan-400" />
                  Email
                </label>
                <motion.div
                  className="relative group"
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.2 }}
                >
                  <motion.div
                    className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-md blur-sm"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full p-4 rounded-md border border-slate-700/50 bg-slate-900/50 text-slate-400 pl-4 backdrop-blur-sm"
                  />
                  <motion.p
                    className="text-xs text-slate-500 mt-2 ml-1 flex items-center gap-1"
                    initial={{ opacity: 0.7 }}
                    whileHover={{ opacity: 1 }}
                  >
                    <Shield className="h-3 w-3" /> Email cannot be changed
                  </motion.p>
                </motion.div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium flex items-center gap-2 text-slate-300">
                  <UserIcon className="h-4 w-4 text-cyan-400" />
                  Display Name
                </label>
                <motion.div
                  className="relative group"
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.2 }}
                >
                  <AnimatePresence>
                    {isEditing && (
                      <motion.div
                        className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/30 to-cyan-500/30 rounded-md blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      />
                    )}
                  </AnimatePresence>
                  <motion.input
                    type="text"
                    name="name"
                    value={formState.name}
                    onChange={handleInputChange}
                    disabled={!isEditing || isLoading}
                    className={`w-full p-4 rounded-md border ${isEditing ? 'border-blue-500/50 bg-slate-900/80' : 'border-slate-700/50 bg-slate-900/50'} text-slate-200 pl-4 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50`}
                    variants={inputVariants}
                    initial="idle"
                    whileFocus="focus"
                  />
                  {isEditing ? (
                    <motion.p
                      className="text-xs text-blue-400 mt-2 ml-1"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      Press Save to confirm your changes
                    </motion.p>
                  ) : (
                    <motion.p
                      className="text-xs text-slate-500 mt-2 ml-1"
                      initial={{ opacity: 0.7 }}
                      whileHover={{ opacity: 1 }}
                    >
                      Click Edit to change your display name
                    </motion.p>
                  )}
                </motion.div>
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <AnimatePresence mode="wait">
                {isEditing ? (
                  <>
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Button
                        type="button"
                        variant="outline"
                        className="bg-transparent border border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-slate-200 transition-all duration-200"
                        onClick={() => {
                          setIsEditing(false);
                          setFormState({ name: user?.name || "" });
                        }}
                        disabled={isLoading}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.2, delay: 0.1 }}
                    >
                      <Button
                        type="button"
                        className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white transition-all duration-200"
                        onClick={handleSave}
                        disabled={isLoading}
                        variant={buttonVariants}
                        initial="idle"
                        whileHover="hover"
                        whileTap="tap"
                      >
                        {isLoading ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"
                          />
                        ) : (
                          <Save className="h-4 w-4 mr-2" />
                        )}
                        Save Changes
                      </Button>
                    </motion.div>
                  </>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <motion.button
                      type="button"
                      className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white transition-all duration-200 px-4 py-2 rounded-md"
                      onClick={() => setIsEditing(true)}
                      initial="idle"
                      whileHover="hover"
                      whileTap="tap"
                    >
                      <Settings className="h-4 w-4 mr-2 inline" />
                      Edit Profile
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div >
  );
};

export default SettingsSection;