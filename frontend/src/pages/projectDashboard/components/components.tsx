import { memo } from "../utils/imports";
import {
  Card, CardHeader, CardTitle, CardContent, CardFooter, Button, Badge, DropdownMenu,
  DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator,
  Clock, GitBranch, Users, MoreVertical, Pencil, Trash2, FolderKanban, Plus, formatDate
} from "../utils/imports";

export const RepoCard = memo(({ repo, navigate, setState, state }) => (
  <Card
    key={repo.id}
    className="overflow-hidden shadow-lg transition-all duration-300 ease-in-out hover:shadow-xl hover:scale-[1.02] cursor-pointer border border-border bg-background rounded-2xl"
    onClick={() => navigate(`/repo/${repo.id}`)}
  >
    <CardHeader className="pb-3">
      <CardTitle className="flex justify-between items-center text-lg font-semibold text-foreground">
        <span className="truncate">
          {repo.name}
          <span className="ml-3"></span>
          <span className="bg-[#00ff9d] text-white rounded-full px-4 py-1 text-xs font-medium">{repo.source}</span>
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={e => {
                e.stopPropagation();
                setState(prev => ({ ...prev, selectedRepo: repo, newRepoName: repo.name, renameOpen: true }));
              }}
            >
              <Pencil className="h-4 w-4 mr-2" />
              Rename
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onClick={e => {
                e.stopPropagation();
                setState(prev => ({ ...prev, selectedRepo: repo, deleteOpen: true }));
              }}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardTitle>
    </CardHeader>
    <CardContent className="pb-3 space-y-2">
      <div className="flex items-center text-sm text-muted-foreground">
        <Clock className="h-4 w-4 mr-1 text-primary" />
        <div>Created: {formatDate(repo.created_at)}</div>
      </div>
      <div className="flex items-center text-sm text-muted-foreground">
        <Clock className="h-4 w-4 mr-1 text-primary" />
        <div>Updated: {formatDate(repo.last_generated_at) || "Never"}</div>
      </div>
    </CardContent>
    <CardFooter className="pt-2 border-t border-border bg-muted/40 rounded-b-2xl">
      <div className="flex justify-between w-full text-sm">
        <div className="flex items-center gap-1">
          <GitBranch className="h-4 w-4 text-primary" />
          <Badge variant="outline" className="px-2 py-1 text-xs font-medium">N/A files</Badge>
        </div>
        <div className="flex items-center gap-1">
          <Users className="h-4 w-4 text-primary" />
          <Badge variant="outline" className="px-2 py-1 text-xs font-medium">{state.project?.collaborators || 0} collaborators</Badge>
        </div>
      </div>
    </CardFooter>
  </Card>
));

export const ProjectsGridSkeleton = memo(() => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {[1, 2, 3].map(i => (
      <div key={i} className="animate-pulse">
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

export const EmptyRepoState = memo(({ setOpen }) => (
  <Card className="overflow-hidden">
    <div className="h-1 bg-primary/20"></div>
    <CardContent className="flex flex-col items-center justify-center py-12">
      <div className="rounded-full bg-primary/10 p-3 mb-4">
        <FolderKanban className="h-6 w-6 text-primary" />
      </div>
      <h3 className="text-lg font-semibold mb-2">No Repositories Yet</h3>
      <p className="text-muted-foreground text-center mb-4">Create your first repository to get started.</p>
      <Button variant="outline" onClick={() => setOpen()}>
        <Plus className="h-4 w-4 mr-2" />
        Create Repository
      </Button>
    </CardContent>
  </Card>
));