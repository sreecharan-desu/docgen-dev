import { projectAtom } from "@/store/store";
import { useRecoilState } from "recoil";
import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
    AlertCircle,
    Pencil,
    Trash2,
    Loader2,
    Upload,
    Github,
    Calendar,
    MoreHorizontal,
    FolderOpen,
    FilePlus2,
    Link,
    ExternalLink,
    Terminal,
    Zap,
    Moon,
    Sun,
    X,
    Check,
    ChevronRight
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
    DELETE_SINGLE_PROJECT_API,
    GET_SINGLE_PROJECT_API,
    RENAME_SINGLE_PROJECT_API,
    IMPORT_GITHUB_REPO_API,
    UPLOAD_LOCAL_FILES_API
} from "@/utils/apis";

// Configuration
const config = {
    GITHUB_CLIENT_ID: "Ov23livmcOJdTGJwAtnB",
    API_URI: "YOUR_API_URI"
};

export default function ProjectPage() {
    const [projectDetails, setProjectDetails] = useRecoilState(projectAtom);
    const JWT_TOKEN = `Bearer ${localStorage.getItem("token")}`;

    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const auth = useAuth();
    const { toast } = useToast();

    const [project, setProject] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [newName, setNewName] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [showGithubDialog, setShowGithubDialog] = useState(false);
    const [showLocalUploadDialog, setShowLocalUploadDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [githubRepo, setGithubRepo] = useState("");
    const [files, setFiles] = useState(null);
    const [importLoading, setImportLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [selectedTab, setSelectedTab] = useState("overview");
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem("theme") || "light";
    });
    const [recentActivity, setRecentActivity] = useState([]);

    useEffect(() => {
        // Check for the OAuth code in URL
        const urlParams = new URLSearchParams(location.search);
        const code = urlParams.get('code');

        if (code) {
            exchangeCodeForToken(code);
        }
    }, [location]);

    // Exchange code for token
    const exchangeCodeForToken = async (code) => {
        try {
            const response = await fetch(`${config.API_URI}/github/oauth/callback`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: JWT_TOKEN,
                },
                body: JSON.stringify({
                    code,
                    projectId: id
                }),
            });

            if (!response.ok) throw new Error('Failed to exchange GitHub code');

            const data = await response.json();
            localStorage.setItem('github_token', data.access_token);

            setProject(prev => ({
                ...prev,
                github_connected: true,
                github_username: data.github_username
            }));

            setRecentActivity(prev => [{
                id: Date.now(),
                type: "connection",
                description: `GitHub account connected: ${data.github_username}`,
                timestamp: new Date().toISOString(),
                user: auth.user?.email || "user@example.com"
            }, ...prev]);

            toast({
                title: "GitHub Connected",
                description: `Successfully connected: ${data.github_username}`,
                variant: "success"
            });
        } catch (err) {
            setError(err.message);
            toast({
                title: "Connection Failed",
                description: err.message,
                variant: "destructive"
            });
        }
    };

    // Format date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        }).format(date);
    };

    // Toggle theme
    const toggleTheme = () => {
        const newTheme = theme === "light" ? "dark" : "light";
        setTheme(newTheme);
        localStorage.setItem("theme", newTheme);
        document.documentElement.classList.toggle("dark");
    };

    useEffect(() => {
        if (theme === "dark") {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    }, [theme]);

    // Generate sample activity
    const generateSampleActivity = (project) => {
        const now = new Date();
        return [
            {
                id: 1,
                type: "import",
                description: "Repository imported",
                timestamp: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
                user: auth.user?.email || "user@example.com"
            },
            {
                id: 2,
                type: "deployment",
                description: "Project deployed",
                timestamp: new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString(),
                user: auth.user?.email || "user@example.com"
            },
            {
                id: 3,
                type: "update",
                description: `Project renamed to "${project?.name}"`,
                timestamp: new Date(now.getTime() - 72 * 60 * 60 * 1000).toISOString(),
                user: auth.user?.email || "user@example.com"
            }
        ];
    };

    // API Calls
    const getProject = async (projectId) => {
        const response = await fetch(`${GET_SINGLE_PROJECT_API}${projectId}`, {
            headers: { Authorization: JWT_TOKEN },
        });
        if (!response.ok) throw new Error("Failed to fetch project");
        return response.json();
    };

    const renameProject = async (projectId, newName) => {
        const response = await fetch(`${RENAME_SINGLE_PROJECT_API}${projectId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: JWT_TOKEN,
            },
            body: JSON.stringify({ name: newName }),
        });
        if (!response.ok) throw new Error("Failed to rename project");
        return response.json();
    };

    const deleteProject = async (projectId) => {
        const response = await fetch(`${DELETE_SINGLE_PROJECT_API}${projectId}`, {
            method: "DELETE",
            headers: { Authorization: JWT_TOKEN },
        });
        if (!response.ok) throw new Error("Failed to delete project");
        return response.json();
    };

    const importGithubRepo = async (projectId, repoUrl) => {
        setImportLoading(true);
        setUploadProgress(0);

        try {
            const progressInterval = setInterval(() => {
                setUploadProgress(prev => {
                    const newProgress = prev + (Math.random() * 10);
                    return newProgress >= 90 ? 90 : newProgress;
                });
            }, 300);

            const response = await fetch(`${IMPORT_GITHUB_REPO_API}${projectId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: JWT_TOKEN,
                },
                body: JSON.stringify({ repo_url: repoUrl }),
            });

            clearInterval(progressInterval);
            setUploadProgress(100);

            if (!response.ok) throw new Error("Failed to import repository");
            const data = await response.json();

            setProject(prev => ({
                ...prev,
                repo_count: prev.repo_count + 1
            }));

            setRecentActivity(prev => [{
                id: Date.now(),
                type: "import",
                description: `Repository imported: ${repoUrl}`,
                timestamp: new Date().toISOString(),
                user: auth.user?.email || "user@example.com"
            }, ...prev]);

            toast({
                title: "Repository imported",
                description: `Successfully imported ${repoUrl}`,
                variant: "success"
            });

            setTimeout(() => {
                setShowGithubDialog(false);
                setUploadProgress(0);
            }, 1000);

            return data;
        } catch (err) {
            setError(err.message);
            toast({
                title: "Import failed",
                description: err.message,
                variant: "destructive"
            });
            throw err;
        } finally {
            setImportLoading(false);
        }
    };

    const uploadLocalFiles = async (projectId, files) => {
        setImportLoading(true);
        setUploadProgress(0);

        try {
            const formData = new FormData();
            if (files) {
                Array.from(files).forEach((file) => {
                    formData.append('files', file);
                });
            }

            const progressInterval = setInterval(() => {
                setUploadProgress(prev => {
                    const newProgress = prev + (Math.random() * 10);
                    return newProgress >= 90 ? 90 : newProgress;
                });
            }, 300);

            const response = await fetch(`${UPLOAD_LOCAL_FILES_API}${projectId}`, {
                method: "POST",
                headers: {
                    Authorization: JWT_TOKEN,
                },
                body: formData,
            });

            clearInterval(progressInterval);
            setUploadProgress(100);

            if (!response.ok) throw new Error("Failed to upload files");
            const data = await response.json();

            setProject(prev => ({
                ...prev,
                file_count: (prev.file_count || 0) + files.length
            }));

            setRecentActivity(prev => [{
                id: Date.now(),
                type: "upload",
                description: `${files.length} files uploaded`,
                timestamp: new Date().toISOString(),
                user: auth.user?.email || "user@example.com"
            }, ...prev]);

            toast({
                title: "Files uploaded",
                description: `Uploaded ${files.length} files`,
                variant: "success"
            });

            setTimeout(() => {
                setShowLocalUploadDialog(false);
                setUploadProgress(0);
            }, 1000);

            return data;
        } catch (err) {
            setError(err.message);
            toast({
                title: "Upload failed",
                description: err.message,
                variant: "destructive"
            });
            throw err;
        } finally {
            setImportLoading(false);
        }
    };

    const handleFileChange = (e) => {
        setFiles(e.target.files);
    };

    // Initial data fetch
    useEffect(() => {
        const fetchProject = async () => {
            try {
                const data = await getProject(id);
                if (!data) throw new Error("Project not found");
                setProject(data);
                setRecentActivity(generateSampleActivity(data));
            } catch (err) {
                setError(err.message);
                toast({
                    title: "Error",
                    description: err.message,
                    variant: "destructive"
                });
            } finally {
                setLoading(false);
            }
        };

        fetchProject();
    }, [id]);

    // Event Handlers
    const handleRename = async (e) => {
        e.preventDefault();
        if (!newName.trim()) return setError("Project name cannot be empty");

        try {
            const response = await renameProject(id, newName);
            setProject((prev) => ({ ...prev, name: response.new_name }));
            setIsEditing(false);
            setNewName("");

            setRecentActivity(prev => [{
                id: Date.now(),
                type: "update",
                description: `Project renamed to "${response.new_name}"`,
                timestamp: new Date().toISOString(),
                user: auth.user?.email || "user@example.com"
            }, ...prev]);

            toast({
                title: "Project renamed",
                description: `Renamed to "${response.new_name}"`,
                variant: "success"
            });
        } catch (err) {
            setError("Failed to rename project");
            toast({
                title: "Rename failed",
                description: "Failed to rename project",
                variant: "destructive"
            });
        }
    };

    const handleDelete = async () => {
        try {
            await deleteProject(id);
            toast({
                title: "Project deleted",
                description: "Project deleted successfully",
                variant: "success"
            });
            navigate("/projects");
        } catch (err) {
            setError("Failed to delete project");
            toast({
                title: "Delete failed",
                description: "Failed to delete project",
                variant: "destructive"
            });
        }
    };

    const initiateGithubOAuth = () => {
        const stateData = {
            operation: 'repo-import',
            projectId: id,
            returnPath: `/projects/${id}`
        };
        const state = JSON.stringify(stateData);
        const redirectUri = "http://localhost:8081/auth/callback/github";
        const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${config.GITHUB_CLIENT_ID}&redirect_uri=${redirectUri}&scope=repo&state=${state}`;
        window.location.href = githubAuthUrl;
    };

    const handleGithubImport = async (e) => {
        e.preventDefault();
        if (!githubRepo.trim()) return;

        try {
            await importGithubRepo(id, githubRepo);
            setGithubRepo("");
        } catch (err) {
            // Error handling done in importGithubRepo
        }
    };

    const handleLocalUpload = async (e) => {
        e.preventDefault();
        if (!files || !files.length) return;

        try {
            await uploadLocalFiles(id, files);
            setFiles(null);
        } catch (err) {
            // Error handling done in uploadLocalFiles
        }
    };

    // Start editing project name
    const startEditing = () => {
        setNewName(project?.name || "");
        setIsEditing(true);
    };

    // Cancel editing
    const cancelEditing = () => {
        setIsEditing(false);
        setNewName("");
    };

    // If loading
    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-lg">Loading project...</span>
            </div>
        );
    }

    // If error
    if (error && !project) {
        return (
            <div className="container mx-auto p-4">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
                <Button className="mt-4" onClick={() => navigate("/projects")}>
                    Back to Projects
                </Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                    {isEditing ? (
                        <form onSubmit={handleRename} className="flex items-center">
                            <Input
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                className="mr-2"
                                placeholder="Project name"
                                autoFocus
                            />
                            <Button type="submit" size="icon" variant="ghost">
                                <Check className="h-4 w-4" />
                            </Button>
                            <Button onClick={cancelEditing} size="icon" variant="ghost">
                                <X className="h-4 w-4" />
                            </Button>
                        </form>
                    ) : (
                        <>
                            <h1 className="text-2xl font-bold mr-2">{project?.name}</h1>
                            <Button onClick={startEditing} size="icon" variant="ghost">
                                <Pencil className="h-4 w-4" />
                            </Button>
                        </>
                    )}
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={toggleTheme}
                        title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
                    >
                        {theme === "light" ? (
                            <Moon className="h-4 w-4" />
                        ) : (
                            <Sun className="h-4 w-4" />
                        )}
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Project Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setShowGithubDialog(true)}>
                                <Github className="mr-2 h-4 w-4" />
                                Import from GitHub
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setShowLocalUploadDialog(true)}>
                                <Upload className="mr-2 h-4 w-4" />
                                Upload Files
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate(`/projects/${id}/files`)}>
                                <FolderOpen className="mr-2 h-4 w-4" />
                                Browse Files
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setShowDeleteDialog(true)} className="text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Project
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
                <TabsList className="mb-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="activity">Activity</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="overview">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="col-span-2">
                            <CardHeader>
                                <CardTitle>Project Details</CardTitle>
                                <CardDescription>
                                    Created on {formatDate(project?.created_at)}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm font-medium">Description</p>
                                        <p className="text-sm text-muted-foreground">
                                            {project?.description || "No description provided"}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Status</p>
                                        <div className="flex items-center mt-1">
                                            <Badge variant={project?.status === "active" ? "default" : "secondary"}>
                                                {project?.status || "Not set"}
                                            </Badge>
                                        </div>
                                    </div>
                                    {project?.github_connected && (
                                        <div>
                                            <p className="text-sm font-medium">Connected GitHub Account</p>
                                            <div className="flex items-center mt-1">
                                                <Github className="h-4 w-4 mr-2" />
                                                <span>{project?.github_username}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                            <CardFooter>
                                <div className="flex space-x-2">
                                    <Button variant="outline" onClick={() => setShowGithubDialog(true)}>
                                        <Github className="mr-2 h-4 w-4" />
                                        Import Repository
                                    </Button>
                                    <Button variant="outline" onClick={() => setShowLocalUploadDialog(true)}>
                                        <Upload className="mr-2 h-4 w-4" />
                                        Upload Files
                                    </Button>
                                </div>
                            </CardFooter>
                        </Card>

                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Stats</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-sm font-medium">Files</p>
                                            <p className="text-2xl font-bold">{project?.file_count || 0}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">Repositories</p>
                                            <p className="text-2xl font-bold">{project?.repo_count || 0}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">Last Updated</p>
                                            <p className="text-sm">
                                                {project?.updated_at ? formatDate(project.updated_at) : "N/A"}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Quick Actions</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <Button variant="outline" className="w-full justify-start" onClick={() => navigate(`/projects/${id}/files`)}>
                                            <FolderOpen className="mr-2 h-4 w-4" />
                                            Browse Files
                                        </Button>
                                        <Button variant="outline" className="w-full justify-start" onClick={() => navigate(`/projects/${id}/new-file`)}>
                                            <FilePlus2 className="mr-2 h-4 w-4" />
                                            New File
                                        </Button>
                                        <Button variant="outline" className="w-full justify-start" onClick={() => navigate(`/projects/${id}/terminal`)}>
                                            <Terminal className="mr-2 h-4 w-4" />
                                            Terminal
                                        </Button>
                                        {project?.deployed_url && (
                                            <Button variant="outline" className="w-full justify-start" onClick={() => window.open(project.deployed_url, "_blank")}>
                                                <ExternalLink className="mr-2 h-4 w-4" />
                                                Open Deployed Site
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="activity">
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Activity</CardTitle>
                            <CardDescription>Recent actions performed on this project</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className="h-[400px]">
                                <div className="space-y-4">
                                    {recentActivity.map((activity) => (
                                        <div key={activity.id} className="flex items-start pb-4 border-b last:border-0">
                                            <div className="mr-4 p-2 bg-muted rounded-full">
                                                {activity.type === "import" && <Github className="h-4 w-4" />}
                                                {activity.type === "update" && <Pencil className="h-4 w-4" />}
                                                {activity.type === "deployment" && <Zap className="h-4 w-4" />}
                                                {activity.type === "connection" && <Link className="h-4 w-4" />}
                                                {activity.type === "upload" && <Upload className="h-4 w-4" />}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm">{activity.description}</p>
                                                <div className="flex items-center mt-1 text-xs text-muted-foreground">
                                                    <Calendar className="h-3 w-3 mr-1" />
                                                    {formatDate(activity.timestamp)}
                                                    <span className="mx-1">•</span>
                                                    {activity.user}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="settings">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>General Settings</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium">Project Name</label>
                                        <Input
                                            value={newName || project?.name}
                                            onChange={(e) => setNewName(e.target.value)}
                                            className="mt-1"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">Description</label>
                                        <Input
                                            value={project?.description || ""}
                                            className="mt-1"
                                            placeholder="No description"
                                        />
                                    </div>
                                    <Button type="submit" onClick={handleRename}>Save Changes</Button>
                                </form>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-destructive">Danger Zone</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <p className="text-sm text-muted-foreground">
                                        These actions are destructive and cannot be undone.
                                    </p>
                                    <Button
                                        variant="destructive"
                                        onClick={() => setShowDeleteDialog(true)}
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete Project
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>

            {/* GitHub Import Dialog */}
            <Dialog open={showGithubDialog} onOpenChange={setShowGithubDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Import from GitHub</DialogTitle>
                        <DialogDescription>
                            Connect your GitHub account or import a repository directly
                        </DialogDescription>
                    </DialogHeader>
                    {importLoading ? (
                        <div className="space-y-4 py-4">
                            <div className="flex items-center space-x-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <p>Importing repository...</p>
                            </div>
                            <Progress value={uploadProgress} />
                        </div>
                    ) : (
                        <>
                            <form onSubmit={handleGithubImport} className="space-y-4 py-4">
                                <div>
                                    <label className="text-sm font-medium">Repository URL</label>
                                    <Input
                                        value={githubRepo}
                                        onChange={(e) => setGithubRepo(e.target.value)}
                                        placeholder="https://github.com/username/repo"
                                        className="mt-1"
                                    />
                                </div>
                                <Button type="submit" disabled={!githubRepo.trim()}>
                                    Import Repository
                                </Button>
                            </form>
                            <Separator className="my-4" />
                            <div className="flex flex-col items-center py-4">
                                <p className="text-sm text-center mb-4">
                                    Connect your GitHub account to import private repositories
                                </p>
                                <Button variant="outline" onClick={initiateGithubOAuth}>
                                    <Github className="mr-2 h-4 w-4" />
                                    Connect GitHub Account
                                </Button>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            {/* Local Upload Dialog */}
            <Dialog open={showLocalUploadDialog} onOpenChange={setShowLocalUploadDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Upload Local Files</DialogTitle>
                        <DialogDescription>
                            Select files from your local machine to upload to this project
                        </DialogDescription>
                    </DialogHeader>
                    {importLoading ? (
                        <div className="space-y-4 py-4">
                            <div className="flex items-center space-x-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <p>Uploading files...</p>
                            </div>
                            <Progress value={uploadProgress} />
                        </div>
                    ) : (
                        <form onSubmit={handleLocalUpload} className="space-y-4 py-4">
                            <div>
                                <label className="text-sm font-medium">Select Files</label>
                                <Input
                                    type="file"
                                    onChange={handleFileChange}
                                    className="mt-1"
                                    multiple
                                />
                            </div>
                            <Button type="submit" disabled={!files || !files.length}>
                                Upload Files
                            </Button>
                        </form>
                    )}
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Delete</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this project? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <p className="text-sm text-muted-foreground">
                            All files, repositories, and data associated with this project will be permanently deleted.
                        </p>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            Delete Project
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}