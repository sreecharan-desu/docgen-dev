import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User as UserIcon, Mail, Settings, Save, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";

interface User {
  email_confirmed: boolean;
  created_at: string;
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
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
      // API call would go here
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setUser((prev) => (prev ? { ...prev, name: formState.name } : null));
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Your profile has been updated",
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

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "MMMM dd, yyyy");
    } catch (error) {
      return "N/A";
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Settings className="h-12 w-12 mb-4 mx-auto text-primary" />
          <h2 className="text-xl font-medium">Loading user information...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <Settings className="h-6 w-6" />
          Account Settings
        </h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      {/* User Avatar section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">
            <UserIcon className="h-5 w-5 inline mr-2" />
            Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div>
              <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name || "User"}
                    className="h-full w-full object-cover rounded-full"
                  />
                ) : (
                  <span className="text-2xl font-semibold">
                    {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-3 flex-1">
              <div>
                <p className="text-xs text-muted-foreground">Member Since</p>
                <p className="text-sm">{formatDate(user.created_at)}</p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Email Status</p>
                <div>
                  {user.email_confirmed ? (
                    <span className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 rounded-full px-2 py-1 text-xs">
                      Verified
                    </span>
                  ) : (
                    <span className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100 rounded-full px-2 py-1 text-xs">
                      Pending Verification
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Information section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Edit Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <label className="text-sm font-medium block mb-1">
                <Mail className="h-4 w-4 inline mr-1" />
                Email
              </label>
              <input
                type="email"
                value={user?.email || ""}
                disabled
                className="w-full p-2 rounded border border-input bg-muted text-muted-foreground"
              />
              <p className="text-xs font-semibold text-muted-foreground mt-1">
                <b>*</b> Email cannot be changed
              </p>
            </div>

            <div>
              <label className="text-sm font-medium block mb-1">
                <UserIcon className="h-4 w-4 inline mr-1" />
                Display Name
              </label>
              <input
                type="text"
                name="name"
                value={formState.name}
                onChange={handleInputChange}
                disabled={!isEditing || isLoading}
                className="w-full p-2 rounded border border-input bg-background"
              />
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-6">
            {isEditing ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setFormState({ name: user?.name || "" });
                  }}
                  disabled={isLoading}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button type="button" onClick={handleSave} disabled={isLoading}>
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </>
            ) : (
              <Button type="button" onClick={() => setIsEditing(true)}>
                <Settings className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsSection;