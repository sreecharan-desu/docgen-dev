import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose,
  Tabs, TabsList, TabsTrigger, TabsContent, Button, Input, Label, Alert,
  AlertDescription, Progress, AlertCircle, RefreshCw, X, Download, Loader,
  Github, Lock, GitBranch, Eye, Folder, FolderUp, FolderSearch
} from "../utils/imports";

export const ImportDialog = ({ state, setState, handleAuthorizeGithub, debouncedHandleImportRepo, debouncedHandleCreateRepo, handleFolderSelect }) => (
  <Dialog
    open={state.open}
    onOpenChange={open => setState(prev => ({ ...prev, open, repoUrl: "", localFiles: null, localFolderName: "", uploadProgress: 0 }))}
  >
    <DialogContent className="sm:max-w-md bg-[#1a1a1a] border border-[#00ff9d] rounded-lg shadow-lg overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[rgb(26,26,26)] to-[#232323] opacity-50 pointer-events-none" />
      <DialogHeader className="flex justify-between items-center border-b border-[#00ff9d]/20 pb-3">
        <div className="flex items-center gap-2">
          <DialogTitle className="text-white text-lg font-semibold">Import Repository</DialogTitle>
        </div>
      </DialogHeader>

      <div className="py-4">
        <p className="text-gray-400 mb-4 flex items-center">
          <GitBranch className="h-4 w-4 mr-2 text-[#00ff9d]" />
          Connect your project to a repository
        </p>

        <Tabs
          value={state.activeTab}
          onValueChange={tab => setState(prev => ({ ...prev, activeTab: tab }))}
        >
          <TabsList className="grid w-full grid-cols-2 bg-[#2a2a2a] rounded-md p-1 mb-4">
            <TabsTrigger value="github" className={`text-white font-medium transition-all duration-200 ${state.activeTab === "github" ? "bg-[#00ff9d] text-black shadow-md" : "bg-transparent hover:bg-[#333333]"} rounded-md`}>
              <Github className="h-4 w-4 mr-2" />
              GitHub
            </TabsTrigger>
            <TabsTrigger value="local" className={`text-white font-medium transition-all duration-200 ${state.activeTab === "local" ? "bg-[#00ff9d] text-black shadow-md" : "bg-transparent hover:bg-[#333333]"} rounded-md`}>
              <Folder className="h-4 w-4 mr-2" />
              Local
            </TabsTrigger>
          </TabsList>

          <TabsContent value="github" className="mt-4 space-y-4">
            {!state.hasGithubAccess ? (
              <div className="text-center bg-[#2a2a2a]/50 p-6 rounded-lg border border-dashed border-[#00ff9d]/30">
                <Github className="h-12 w-12 mx-auto mb-3 text-[#00ff9d]" />
                <p className="text-gray-300 mb-4">Authorize GitHub to see and import your repositories</p>
                <Button onClick={handleAuthorizeGithub} className="bg-[#00ff9d] text-black hover:bg-[#00ff9d]/90 font-medium shadow-lg shadow-[#00ff9d]/20 transition-all duration-200">
                  <Lock className="h-4 w-4 mr-2" />
                  Authorize GitHub Now
                </Button>
              </div>
            ) : state.showRepoList && state.githubRepos.length > 0 ? (
              <div className="max-h-64 overflow-y-auto pr-1 space-y-2">
                {state.githubRepos.map(repo => (
                  <div key={repo.url} className="flex justify-between items-center p-3 rounded-md bg-[#2a2a2a] hover:bg-[#333333] transition-colors duration-200 border-l-2 border-[#00ff9d]">
                    <div>
                      <p className="text-white font-medium flex items-center">
                        <GitBranch className="h-4 w-4 mr-2 text-[#00ff9d]" />
                        {repo.name}
                      </p>
                      <p className="text-gray-400 text-sm flex items-center mt-1">
                        <Eye className="h-3 w-3 mr-1" />
                        {repo.visibility}
                      </p>
                    </div>
                    <Button onClick={() => debouncedHandleImportRepo(repo)} className="bg-[#00ff9d] text-black hover:bg-[#00ff9d]/90 shadow-md shadow-[#00ff9d]/10" disabled={state.isLoading}>
                      <Download className="h-4 w-4 mr-1" />
                      Import
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center bg-[#2a2a2a]/50 p-6 rounded-lg border border-dashed border-gray-700">
                <FolderSearch className="h-12 w-12 mx-auto mb-3 text-gray-500" />
                <p className="text-gray-400">No repositories found</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="local" className="mt-4">
            <div className="space-y-4">
              <div className="bg-[#2a2a2a]/50 p-4 rounded-lg border border-dashed border-[#00ff9d]/30">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right col-span-1 text-white font-medium">Upload Folder</Label>
                  <div className="col-span-3">
                    <div className="relative">
                      <input type="file" webkitdirectory="true" directory="" onChange={handleFolderSelect} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-[#00ff9d] file:text-black hover:file:bg-[#00ff9d]/90 focus:outline-none" />
                      <FolderUp className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>

              {state.localFolderName && (
                <div className="bg-[#2a2a2a]/50 p-4 rounded-lg border border-[#00ff9d]/20 animate-fadeIn">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right col-span-1 text-white font-medium">Selected Folder</Label>
                    <div className="col-span-3">
                      <div className="relative">
                        <Input value={state.localFolderName} readOnly className="bg-[#333333] text-white border-[#00ff9d]/40 focus:border-[#00ff9d] cursor-not-allowed pl-9" />
                        <Folder className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#00ff9d]" />
                      </div>
                    </div>
                  </div>
                  {state.isLoading && (
                    <div className="mt-4">
                      <Progress value={state.uploadProgress} className="w-full" />
                      <p className="text-sm text-gray-400 mt-2 text-center">Uploading: {Math.round(state.uploadProgress)}%</p>
                    </div>
                  )}
                </div>
              )}

              {state.errors.create && state.activeTab === "local" && (
                <Alert variant="destructive" className="mt-4 bg-red-900/20 border border-red-500/50 text-red-200">
                  <AlertCircle className="h-4 w-4 mr-2 text-red-400" />
                  <AlertDescription className="flex items-center justify-between w-full">
                    <span>{state.errors.create}</span>
                    <Button variant="outline" size="sm" className="ml-4 border-red-500/50 hover:bg-red-900/30 text-red-200" onClick={debouncedHandleCreateRepo} disabled={state.isLoading}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Retry
                    </Button>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {state.errors.create && state.activeTab === "github" && (
          <Alert variant="destructive" className="mt-4 bg-red-900/20 border border-red-500/50 text-red-200">
            <AlertCircle className="h-4 w-4 mr-2 text-red-400" />
            <AlertDescription className="flex items-center justify-between w-full">
              <span>{state.errors.create}</span>
              <Button variant="outline" size="sm" className="ml-4 border-red-500/50 hover:bg-red-900/30 text-red-200" onClick={debouncedHandleCreateRepo} disabled={state.isLoading}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}
      </div>

      {state.activeTab === "local" && (
        <DialogFooter className="border-t border-[#00ff9d]/20 pt-3 gap-3">
          <DialogClose asChild>
            <Button variant="outline" disabled={state.isLoading} className="text-white border-gray-600 hover:bg-[#2a2a2a] hover:text-[#00ff9d]">
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </DialogClose>
          <Button
            onClick={debouncedHandleCreateRepo}
            disabled={state.isLoading || !state.localFiles}
            className={`bg-[#00ff9d] text-black hover:bg-[#00ff9d]/90 font-medium shadow-lg shadow-[#00ff9d]/20 transition-all duration-200 ${state.isLoading || !state.localFiles ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {state.isLoading ? (
              <>
                <Loader className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Import Repository
              </>
            )}
          </Button>
        </DialogFooter>
      )}
    </DialogContent>
  </Dialog>
);

export const RenameDialog = ({ state, setState, debouncedHandleRenameRepo }) => (
  <Dialog open={state.renameOpen} onOpenChange={open => setState(prev => ({ ...prev, renameOpen: open }))}>
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Rename Repository</DialogTitle>
      </DialogHeader>
      <div className="py-4">
        <Input value={state.newRepoName} onChange={e => setState(prev => ({ ...prev, newRepoName: e.target.value }))} placeholder="Enter new repository name" className="mb-4" />
        {state.errors.rename && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4 mr-2" />
            <AlertDescription>
              {state.errors.rename}
              <Button variant="outline" size="sm" className="ml-4" onClick={debouncedHandleRenameRepo} disabled={state.isLoading}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline" disabled={state.isLoading}>Cancel</Button>
        </DialogClose>
        <Button onClick={debouncedHandleRenameRepo} disabled={state.isLoading || !state.newRepoName.trim()}>
          {state.isLoading ? "Renaming..." : "Rename"}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export const DeleteDialog = ({ state, setState, debouncedHandleDeleteRepo }) => (
  <Dialog open={state.deleteOpen} onOpenChange={open => setState(prev => ({ ...prev, deleteOpen: open }))}>
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Delete Repository</DialogTitle>
      </DialogHeader>
      <div className="py-4">
        <p className="text-muted-foreground">
          Are you sure you want to delete repository <span className="font-semibold">{state.selectedRepo?.name}</span>? This action cannot be undone.
        </p>
        {state.errors.delete && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4 mr-2" />
            <AlertDescription>
              {state.errors.delete}
              <Button variant="outline" size="sm" className="ml-4" onClick={debouncedHandleDeleteRepo} disabled={state.isLoading}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline" disabled={state.isLoading}>Cancel</Button>
        </DialogClose>
        <Button variant="destructive" onClick={debouncedHandleDeleteRepo} disabled={state.isLoading}>
          {state.isLoading ? "Deleting..." : "Delete"}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);