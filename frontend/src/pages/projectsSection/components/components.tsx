/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback, memo } from "react";
import * as LucideIcons from "lucide-react";
import { formatDate } from "@/utils/functions";
import { UI } from "./Imports"

// Memoized Components (unchanged from original for brevity, assumed to be correct)
export const SearchHeader = memo(({ searchTerm, setSearchTerm, onCreateClick }: any) => (
    <header className="mb-8">
        <div className="flex justify-between items-center mb-4">
            <div>
                <h1 className="text-3xl font-bold mb-2">Projects</h1>
                <p className="text-muted-foreground">Manage your DocGen projects</p>
            </div>
            <UI.Button onClick={onCreateClick}>
                <LucideIcons.Plus className="h-4 w-4 mr-2" />
                Create Project
            </UI.Button>
        </div>
        <div className="relative flex-1">
            <LucideIcons.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <UI.Input
                placeholder="Search projects..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10 pr-10 w-full"
            />
            {searchTerm && (
                <LucideIcons.X
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground cursor-pointer"
                    onClick={() => setSearchTerm("")}
                />
            )}
        </div>
    </header>
));

export const ProjectCard = memo(({ project, onSelect, onRename, onDelete }: any) => (
    <UI.Card
        className="overflow-hidden shadow-lg transition-all duration-300 ease-in-out hover:shadow-xl hover:scale-[1.02] cursor-pointer border border-border bg-background rounded-2xl"
        onClick={() => onSelect(project)}
    >
        <UI.CardHeader className="pb-3">
            <UI.CardTitle className="flex justify-between items-center text-lg font-semibold text-foreground">
                <span className="truncate">{project.name}</span>
                <UI.DropdownMenu>
                    <UI.DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                        <UI.Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <LucideIcons.MoreVertical className="h-4 w-4" />
                        </UI.Button>
                    </UI.DropdownMenuTrigger>
                    <UI.DropdownMenuContent align="end">
                        <UI.DropdownMenuItem onClick={e => { e.stopPropagation(); onRename(project); }}>
                            <LucideIcons.Pencil className="h-4 w-4 mr-2" />
                            Rename
                        </UI.DropdownMenuItem>
                        <UI.DropdownMenuSeparator />
                        <UI.DropdownMenuItem className="text-destructive" onClick={e => { e.stopPropagation(); onDelete(project); }}>
                            <LucideIcons.Trash2 className="h-4 w-4 mr-2" />
                            Delete
                        </UI.DropdownMenuItem>
                    </UI.DropdownMenuContent>
                </UI.DropdownMenu>
            </UI.CardTitle>
            <UI.CardDescription className="truncate text-muted-foreground text-sm">
                {project.description}
            </UI.CardDescription>
        </UI.CardHeader>
        <UI.CardContent className="pb-3 space-y-2">
            <div className="flex items-center text-sm text-muted-foreground">
                <LucideIcons.Clock className="h-4 w-4 mr-1 text-primary" />
                Created: {formatDate(project.created_at)}
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
                <LucideIcons.Clock className="h-4 w-4 mr-1 text-primary" />
                Updated: {formatDate(project.updated_at) || "Never"}
            </div>
        </UI.CardContent>
        <UI.CardFooter className="pt-2 border-t border-border bg-muted/40 rounded-b-2xl">
            <div className="flex justify-between w-full text-sm">
                <div className="flex items-center gap-1">
                    <LucideIcons.GitBranch className="h-4 w-4 text-primary" />
                    <UI.Badge variant="outline" className="px-2 py-1 text-xs font-medium">
                        {project.repo_count} repos
                    </UI.Badge>
                </div>
                <div className="flex items-center gap-1">
                    <LucideIcons.Users className="h-4 w-4 text-primary" />
                    <UI.Badge variant="outline" className="px-2 py-1 text-xs font-medium">
                        {project.collaborator_count} collaborators
                    </UI.Badge>
                </div>
            </div>
        </UI.CardFooter>
    </UI.Card>
));

export const EmptyState = memo(({ onCreateClick }: any) => (
    <UI.Card className="overflow-hidden">
        <div className="h-1 bg-primary/20"></div>
        <UI.CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-primary/10 p-3 mb-4">
                <LucideIcons.FolderKanban className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Projects Yet</h3>
            <p className="text-muted-foreground text-center mb-4">Create your first project to get started.</p>
            <UI.Button onClick={onCreateClick}>
                <LucideIcons.Plus className="h-4 w-4 mr-2" />
                Create Project
            </UI.Button>
        </UI.CardContent>
    </UI.Card>
));

export const ErrorAlert = memo(({ message, onRetry }: any) => (
    <UI.Alert variant="destructive" className="mb-6">
        <LucideIcons.AlertCircle className="h-4 w-4 mr-2" />
        <UI.AlertDescription>
            {message}
            {onRetry && (
                <UI.Button variant="outline" size="sm" className="ml-4" onClick={onRetry}>
                    <LucideIcons.RefreshCw className="h-4 w-4 mr-2" />
                    Retry
                </UI.Button>
            )}
        </UI.AlertDescription>
    </UI.Alert>
));

export const CreateProjectDialog = memo(({ open, onOpenChange, onCreate, isLoading, error, onClearError }: any) => {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");

    useEffect(() => {
        if (!open) {
            setName("");
            setDescription("");
            onClearError('create');
        }
    }, [open, onClearError]);

    const handleSubmit = useCallback(() => onCreate(name, description), [name, description, onCreate]);

    return (
        <UI.Dialog open={open} onOpenChange={onOpenChange}>
            <UI.DialogContent className="sm:max-w-md">
                <UI.DialogHeader>
                    <UI.DialogTitle>Create New Project</UI.DialogTitle>
                </UI.DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <UI.Label className="text-right">Name</UI.Label>
                        <UI.Input value={name} onChange={e => setName(e.target.value)} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <UI.Label className="text-right">Description</UI.Label>
                        <UI.Input value={description} onChange={e => setDescription(e.target.value)} className="col-span-3" />
                    </div>
                    {error && <ErrorAlert message={error} onRetry={handleSubmit} />}
                </div>
                <UI.DialogFooter>
                    <UI.DialogClose asChild>
                        <UI.Button variant="outline" disabled={isLoading}>Cancel</UI.Button>
                    </UI.DialogClose>
                    <UI.Button onClick={handleSubmit} disabled={isLoading}>
                        {isLoading ? "Creating..." : "Create"}
                    </UI.Button>
                </UI.DialogFooter>
            </UI.DialogContent>
        </UI.Dialog>
    );
});

export const RenameProjectDialog = memo(({ open, onOpenChange, selectedProject, onRename, isLoading, error, onClearError }: any) => {
    const [newName, setNewName] = useState("");

    useEffect(() => {
        if (selectedProject) setNewName(selectedProject.name);
        if (!open) onClearError('rename');
    }, [selectedProject, open, onClearError]);

    const handleSubmit = useCallback(() => selectedProject && onRename(selectedProject.id, newName), [selectedProject, newName, onRename]);

    return (
        <UI.Dialog open={open} onOpenChange={onOpenChange}>
            <UI.DialogContent className="sm:max-w-md">
                <UI.DialogHeader>
                    <UI.DialogTitle>Rename Project</UI.DialogTitle>
                </UI.DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <UI.Label className="text-right">New Name</UI.Label>
                        <UI.Input value={newName} onChange={e => setNewName(e.target.value)} className="col-span-3" />
                    </div>
                    {error && <ErrorAlert message={error} onRetry={handleSubmit} />}
                </div>
                <UI.DialogFooter>
                    <UI.DialogClose asChild>
                        <UI.Button variant="outline" disabled={isLoading}>Cancel</UI.Button>
                    </UI.DialogClose>
                    <UI.Button onClick={handleSubmit} disabled={isLoading}>
                        {isLoading ? "Renaming..." : "Rename"}
                    </UI.Button>
                </UI.DialogFooter>
            </UI.DialogContent>
        </UI.Dialog>
    );
});

export const DeleteProjectDialog = memo(({ open, onOpenChange, selectedProject, onDelete, isLoading, error }: any) => {
    const handleSubmit = useCallback(() => selectedProject && onDelete(selectedProject.id), [selectedProject, onDelete]);

    return (
        <UI.Dialog open={open} onOpenChange={onOpenChange}>
            <UI.DialogContent className="sm:max-w-md">
                <UI.DialogHeader>
                    <UI.DialogTitle>Delete Project</UI.DialogTitle>
                </UI.DialogHeader>
                <div className="py-4">
                    <p className="text-muted-foreground">
                        Are you sure you want to delete project <span className="font-semibold">{selectedProject?.name}</span>?
                        This action cannot be undone.
                    </p>
                    {error && <ErrorAlert message={error} onRetry={handleSubmit} />}
                </div>
                <UI.DialogFooter>
                    <UI.DialogClose asChild>
                        <UI.Button variant="outline" disabled={isLoading}>Cancel</UI.Button>
                    </UI.DialogClose>
                    <UI.Button variant="destructive" onClick={handleSubmit} disabled={isLoading}>
                        {isLoading ? "Deleting..." : "Delete"}
                    </UI.Button>
                </UI.DialogFooter>
            </UI.DialogContent>
        </UI.Dialog>
    );
});

export const ProjectsGridSkeleton = memo(() => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array(9).fill().map((_, idx) => (
            <div key={`skeleton-${idx}`} className="animate-pulse">
                <div className="h-1 bg-gray-300 w-full"></div>
                <div className="p-6 space-y-4">
                    <div className="h-5 bg-gray-300 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-300 rounded w-full"></div>
                    <div className="space-y-2">
                        <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                        <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                    </div>
                    <div className="flex justify-between pt-2">
                        <div className="h-6 bg-gray-300 rounded w-1/4"></div>
                        <div className="h-6 bg-gray-300 rounded w-1/4"></div>
                    </div>
                </div>
            </div>
        ))}
    </div>
));