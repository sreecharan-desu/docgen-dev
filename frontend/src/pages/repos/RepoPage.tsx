import React, { useState, useEffect, useCallback, memo, Suspense } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  File,
  FileCheck,
  RefreshCw,
  Upload,
  Folder,
  ChevronRight,
  Info,
  ExternalLink,
  Calendar,
  FileSymlink,
  Circle,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Layers,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LoadingAnimation } from "@/AppRoutes";
import { apiMethods } from "@/utils/apis";
import { deepEqual, formatDate } from "@/utils/functions";
import { useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { CardHeader, CardTitle } from '@/components/ui/card';

// Lazy-loaded components
const Button = React.lazy(() => import("@/components/ui/button").then(mod => ({ default: mod.Button })));
const Dialog = React.lazy(() => import("@/components/ui/dialog").then(mod => ({ default: mod.Dialog })));
const DialogContent = React.lazy(() => import("@/components/ui/dialog").then(mod => ({ default: mod.DialogContent })));
const DialogHeader = React.lazy(() => import("@/components/ui/dialog").then(mod => ({ default: mod.DialogHeader })));
const DialogTitle = React.lazy(() => import("@/components/ui/dialog").then(mod => ({ default: mod.DialogTitle })));
const Alert = React.lazy(() => import("@/components/ui/alert").then(mod => ({ default: mod.Alert })));
const AlertDescription = React.lazy(() => import("@/components/ui/alert").then(mod => ({ default: mod.AlertDescription })));
const Input = React.lazy(() => import("@/components/ui/input").then(mod => ({ default: mod.Input })));
const Card = React.lazy(() => import("@/components/ui/card").then(mod => ({ default: mod.Card })));
const CardContent = React.lazy(() => import("@/components/ui/card").then(mod => ({ default: mod.CardContent })));
const Badge = React.lazy(() => import("@/components/ui/badge").then(mod => ({ default: mod.Badge })));

// Cache implementation
export const repoCache = new Map();

// Format file size
const formatFileSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
};

// Build file tree
const buildFileTree = (repoName, files = []) => {
  const tree = { name: repoName || "Unnamed Repository", children: [], isFolder: true };
  files.forEach(file => {
    if (!file?.path || typeof file.path !== 'string') return;
    const parts = file.path.split('/').filter(Boolean);
    let current = tree;
    parts.forEach((part, index) => {
      const isLast = index === parts.length - 1;
      if (isLast) {
        current.children.push({
          name: part,
          isFolder: false,
          size: file.size,
          modified: file.modified,
        });
      } else {
        let folder = current.children.find(child => child.name === part && child.isFolder);
        if (!folder) {
          folder = { name: part, children: [], isFolder: true };
          current.children.push(folder);
        }
        current = folder;
      }
    });
  });
  return tree;
};

// Group files by extension
const groupFilesByExtension = (files = []) => {
  const groups = {};
  files.forEach(file => {
    if (!file?.path) return;
    const extension = file.path.split('.').pop().toLowerCase() || 'other';
    groups[extension] = (groups[extension] || 0) + 1;
  });
  return groups;
};

// Skeleton Loaders
const Skeleton = ({ className }) => (
  <div className={`bg-[#1a1c23] animate-pulse rounded ${className}`} />
);

const SidebarSkeleton = () => (
  <div className="w-72 bg-background border-r border-border h-full">
    <div className="p-4 border-b border-border flex items-center justify-between">
      <Skeleton className="h-6 w-32" />
      <Skeleton className="h-6 w-6 rounded-full" />
    </div>
    <div className="p-3 space-y-3">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-10 ml-auto rounded-full" />
        </div>
      ))}
    </div>
  </div>
);

const HeaderSkeleton = () => (
  <div className="border-b border-border p-4 flex items-center justify-between bg-background">
    <div className="flex items-center gap-3">
      <Skeleton className="h-8 w-8 rounded-full" />
      <Skeleton className="h-6 w-48" />
    </div>
    <Skeleton className="h-8 w-20 rounded-full" />
  </div>
);

const MainSkeleton = () => (
  <div className="p-6 flex-1">
    <div className="space-y-6 max-w-4xl mx-auto">
      <Skeleton className="h-7 w-56" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-24 w-full rounded-lg" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </div>
    </div>
  </div>
);

const FooterSkeleton = () => (
  <div className="h-8 border-t border-border bg-[#1a1c23] flex items-center px-4 justify-between">
    <Skeleton className="h-3.5 w-24 rounded-full" />
    <Skeleton className="h-3.5 w-16 rounded-full" />
  </div>
);

// FileTree3DVisualization Component
const FileTree3DVisualization = memo(({ fileTree }) => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);

  // Color schemes for different file types
  const FILE_COLORS = {
    js: 0xf7df1e,    // JavaScript - Yellow
    jsx: 0x61dafb,   // JSX - React Blue
    ts: 0x3178c6,    // TypeScript - Blue
    tsx: 0x61dafb,   // TSX - React Blue
    css: 0x264de4,   // CSS - Blue
    scss: 0xcc6699,  // SCSS - Pink
    html: 0xe34c26,  // HTML - Orange
    json: 0x292929,  // JSON - Dark Gray
    md: 0x663399,    // Markdown - Purple
    svg: 0xff9900,   // SVG - Orange
    png: 0x4caf50,   // PNG - Green
    jpg: 0x2196f3,   // JPG - Blue
    default: 0xcccccc // Default - Light Gray
  };

  const getFileColor = (fileName) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    return FILE_COLORS[extension] || FILE_COLORS.default;
  };

  const getFileGeometry = (fileName) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (['png', 'jpg', 'jpeg', 'svg', 'gif'].includes(extension)) {
      return new THREE.PlaneGeometry(0.7, 0.7);
    }
    if (['js', 'jsx', 'ts', 'tsx', 'css', 'scss', 'html', 'json'].includes(extension)) {
      return new THREE.BoxGeometry(0.7, 0.7, 0.7);
    }
    if (['md', 'txt', 'pdf', 'doc'].includes(extension)) {
      return new THREE.CylinderGeometry(0.35, 0.35, 0.7, 16);
    }
    return new THREE.SphereGeometry(0.4, 16, 16);
  };

  useEffect(() => {
    if (!mountRef.current || !fileTree) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f1117);
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(0, 0, 15);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.enableZoom = true;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 10);
    scene.add(directionalLight);

    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    const nodes = [];
    const links = [];

    const createFolderNode = (name, depth = 0) => {
      const geometry = new THREE.SphereGeometry(0.8, 16, 16);
      const material = new THREE.MeshStandardMaterial({
        color: 0x4285f4,
        roughness: 0.7,
        metalness: 0.2
      });
      const mesh = new THREE.Mesh(geometry, material);

      const sprite = createTextSprite(name, 18);
      sprite.position.set(0, 1.2, 0);
      mesh.add(sprite);

      mesh.userData = { name, isFolder: true, depth, positionIndex: nodes.length };
      nodes.push({ mesh, x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0 });
      return mesh;
    };

    const createFileNode = (name, depth = 0) => {
      const geometry = getFileGeometry(name);
      const material = new THREE.MeshStandardMaterial({
        color: getFileColor(name),
        roughness: 0.5,
        metalness: 0.3
      });
      const mesh = new THREE.Mesh(geometry, material);

      const sprite = createTextSprite(name, 14);
      sprite.position.set(0, 0.8, 0);
      mesh.add(sprite);

      mesh.userData = { name, isFolder: false, depth, positionIndex: nodes.length };
      nodes.push({ mesh, x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0 });
      return mesh;
    };

    const createTextSprite = (text, fontSize) => {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = 256;
      canvas.height = 128;
      context.fillStyle = 'rgba(26, 28, 35, 0.8)';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.font = `Bold ${fontSize}px Arial`;
      context.fillStyle = '#ffffff';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText(text, canvas.width / 2, canvas.height / 2);

      const texture = new THREE.CanvasTexture(canvas);
      const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.scale.set(fontSize === 18 ? 2 : 1.6, fontSize === 18 ? 1 : 0.8, 1);
      return sprite;
    };

    const processNode = (node, parent = null, depth = 0) => {
      const nodeMesh = node.isFolder ? createFolderNode(node.name, depth) : createFileNode(node.name, depth);
      rootGroup.add(nodeMesh);

      if (parent) {
        links.push({
          source: parent.userData.positionIndex,
          target: nodeMesh.userData.positionIndex,
          strength: 1 / (depth + 1)
        });

        const material = new THREE.LineBasicMaterial({ color: 0x4d4d4d, transparent: true, opacity: 0.5 });
        const geometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
        const line = new THREE.Line(geometry, material);
        line.userData = { sourceIndex: parent.userData.positionIndex, targetIndex: nodeMesh.userData.positionIndex };
        rootGroup.add(line);
      }

      if (node.isFolder && node.children) {
        node.children.forEach(child => processNode(child, nodeMesh, depth + 1));
      }
    };

    processNode(fileTree);

    const simulateForces = () => {
      // Repulsive forces
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[j].x - nodes[i].x;
          const dy = nodes[j].y - nodes[i].y;
          const dz = nodes[j].z - nodes[i].z;
          const distance = Math.max(Math.sqrt(dx * dx + dy * dy + dz * dz), 0.1);
          const force = 5 / (distance * distance);

          nodes[i].vx -= (dx / distance) * force;
          nodes[i].vy -= (dy / distance) * force;
          nodes[i].vz -= (dz / distance) * force;
          nodes[j].vx += (dx / distance) * force;
          nodes[j].vy += (dy / distance) * force;
          nodes[j].vz += (dz / distance) * force;
        }
      }

      // Attractive forces
      links.forEach(link => {
        const source = nodes[link.source];
        const target = nodes[link.target];
        const dx = target.x - source.x;
        const dy = target.y - source.y;
        const dz = target.z - source.z;
        const distance = Math.max(Math.sqrt(dx * dx + dy * dy + dz * dz), 0.1);
        const force = (distance - 2) * 0.05 * link.strength;

        source.vx += (dx / distance) * force;
        source.vy += (dy / distance) * force;
        source.vz += (dz / distance) * force;
        target.vx -= (dx / distance) * force;
        target.vy -= (dy / distance) * force;
        target.vz -= (dz / distance) * force;
      });

      // Update positions
      nodes.forEach(node => {
        node.vx *= 0.95;
        node.vy *= 0.95;
        node.vz *= 0.95;
        node.x += node.vx;
        node.y += node.vy;
        node.z += node.vz;
        node.mesh.position.set(node.x, node.y, node.z);
      });

      // Update lines
      rootGroup.children.forEach(child => {
        if (child instanceof THREE.Line) {
          const source = nodes[child.userData.sourceIndex];
          const target = nodes[child.userData.targetIndex];
          const positions = child.geometry.attributes.position;
          positions.setXYZ(0, source.x, source.y, source.z);
          positions.setXYZ(1, target.x, target.y, target.z);
          positions.needsUpdate = true;
        }
      });
    };

    let frameCount = 0;
    const maxIterations = 100;

    const animate = () => {
      requestAnimationFrame(animate);
      if (frameCount < maxIterations) {
        simulateForces();
        frameCount++;
        if (frameCount === maxIterations) setIsLoading(false);
      }
      controls.update();
      renderer.render(scene, camera);
    };

    animate();
    sceneRef.current = { scene, camera, controls, renderer };

    const handleResize = () => {
      if (!mountRef.current) return;
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      scene.dispose();
    };
  }, [fileTree]);

  const handleReset = () => sceneRef.current?.controls.reset();
  const handleZoomIn = () => {
    if (sceneRef.current?.camera) {
      sceneRef.current.camera.position.z -= 2;
    }
  };
  const handleZoomOut = () => {
    if (sceneRef.current?.camera) {
      sceneRef.current.camera.position.z += 2;
    }
  };

  return (
    <Card className="w-full overflow-hidden border border-border">
      <CardHeader className="p-4 border-b border-border">
        <CardTitle className="text-sm font-medium flex items-center">
          <Layers className="h-4 w-4 mr-2 text-primary" />
          3D File Structure Visualization
          {isLoading && (
            <span className="ml-2 text-xs font-normal text-muted-foreground animate-pulse">
              Generating layout...
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 relative">
        <div ref={mountRef} className="w-full h-[400px] bg-[#0f1117]" />
        <div className="absolute bottom-4 right-4 flex gap-2">
          <Button variant="secondary" size="sm" className="w-8 h-8 p-0 rounded-full" onClick={handleReset}>
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button variant="secondary" size="sm" className="w-8 h-8 p-0 rounded-full" onClick={handleZoomIn}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="secondary" size="sm" className="w-8 h-8 p-0 rounded-full" onClick={handleZoomOut}>
            <ZoomOut className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
      <div className="p-3 border-t border-border text-xs text-muted-foreground">
        Drag to rotate • Scroll to zoom • Double-click to focus
      </div>
    </Card>
  );
});

const RepoPage = memo(() => {
  const { id: repoId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [state, setState] = useState({
    projectId: '',
    repo: null,
    isLoading: true,
    errors: {},
    hasFetched: false,
    uploadedFiles: [],
    showUploadDialog: false,
    selectedFile: null,
    expandedFolders: new Set(),
  });

  const validateToken = useCallback(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return false;
    }
    return true;
  }, [navigate]);

  const fetchRepoData = useCallback(async (force = false) => {
    if (!validateToken() || !repoId) return;

    if (!force && repoCache.has(repoId)) {
      const cachedRepo = repoCache.get(repoId);
      setState(prev => ({
        ...prev,
        repo: cachedRepo,
        projectId: cachedRepo?.project_id || '',
        isLoading: false,
        hasFetched: true,
        expandedFolders: new Set([cachedRepo?.name || "Unnamed Repository"]),
        showUploadDialog: cachedRepo?.source === "local" && !cachedRepo?.files?.length,
      }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const [repoData, filesData] = await Promise.all([
        apiMethods.getRepository(repoId),
        apiMethods.listRepofiles(repoId).catch(() => ({ files: [] })),
      ]);

      const updatedRepo = {
        ...repoData,
        files: Array.isArray(filesData?.files) ? filesData.files : [],
      };

      repoCache.set(repoId, updatedRepo);

      setState(prev => ({
        ...prev,
        repo: updatedRepo,
        projectId: updatedRepo.project_id || '',
        isLoading: false,
        hasFetched: true,
        expandedFolders: new Set([updatedRepo.name || "Unnamed Repository"]),
        showUploadDialog: updatedRepo.source === "local" && !updatedRepo.files.length,
      }));
    } catch (err) {
      setState(prev => ({
        ...prev,
        errors: { ...prev.errors, fetch: err.message || "Error fetching repository" },
        isLoading: false,
        hasFetched: true,
      }));
      toast.error("Failed to load repository data");
    }
  }, [repoId, validateToken]);

  const handleFolderUpload = useCallback((event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    const fileList = files.map(file => ({
      path: file.webkitRelativePath || file.name,
      size: file.size,
      modified: file.lastModified ? new Date(file.lastModified).toISOString() : new Date().toISOString(),
    }));
    setState(prev => ({
      ...prev,
      uploadedFiles: fileList,
      repo: prev.repo ? { ...prev.repo, files: fileList } : prev.repo,
      showUploadDialog: false,
    }));
    toast.success("Folder uploaded successfully");
  }, []);

  useEffect(() => {
    if (!state.hasFetched && repoId) {
      fetchRepoData(true);
    }
    return () => {
      if (repoCache.size > 50) repoCache.clear();
    };
  }, [fetchRepoData, state.hasFetched, repoId]);

  const FileExplorer = memo(({ files }) => {
    const fileTree = buildFileTree(state.repo?.name, files);

    const toggleFolder = useCallback((path) => {
      setState(prev => {
        const newExpanded = new Set(prev.expandedFolders);
        newExpanded.has(path) ? newExpanded.delete(path) : newExpanded.add(path);
        return { ...prev, expandedFolders: newExpanded };
      });
    }, []);

    const getFileIcon = useCallback((filename) => {
      return <File className="h-4 w-4 text-primary flex-shrink-0" />;
    }, []);

    const renderTree = useCallback((node, path = state.repo?.name || "Unnamed Repository") => (
      <div className={node.name !== (state.repo?.name || "Unnamed Repository") ? "ml-4" : ""}>
        {node.isFolder ? (
          <div>
            <button
              onClick={() => toggleFolder(path)}
              className="flex items-center gap-2 py-1.5 px-2 text-sm text-muted-foreground hover:bg-[#1a1c23] rounded-md transition-colors w-full text-left group"
            >
              {state.expandedFolders.has(path) ? (
                <ChevronRight className="h-4 w-4 flex-shrink-0 text-primary" />
              ) : (
                <ChevronLeft className="h-4 w-4 flex-shrink-0 text-primary" />
              )}
              <Folder className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="truncate flex-1">{node.name}</span>
              <span className="text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                {node.children.length}
              </span>
            </button>
            {state.expandedFolders.has(path) && (
              <div className="mt-1">
                {node.children
                  .sort((a, b) => a.isFolder === b.isFolder ? a.name.localeCompare(b.name) : a.isFolder ? -1 : 1)
                  .map(child => renderTree(child, `${path}/${child.name}`))}
              </div>
            )}
          </div>
        ) : (
          <div
            className={`flex items-center justify-between gap-2 py-1.5 px-2 text-sm rounded-md transition-colors cursor-pointer group ${state.selectedFile === path ? "bg-[#1a1c23] text-foreground" : "text-muted-foreground hover:bg-[#1a1c23]/50"}`}
            onClick={() => setState(prev => ({ ...prev, selectedFile: path }))}
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {getFileIcon(node.name)}
              <span className="truncate">{node.name}</span>
            </div>
            <div className="text-xs text-muted-foreground flex-shrink-0 opacity-60 group-hover:opacity-100 transition-opacity">
              {node.size !== undefined && formatFileSize(node.size)}
            </div>
          </div>
        )}
      </div>
    ), [state.expandedFolders, state.selectedFile, state.repo?.name, getFileIcon]);

    return (
      <div className={`bg-background border-r border-border transition-all duration-300 ${isSidebarOpen ? 'w-72' : 'w-0'}`}>
        <div className={`h-full ${isSidebarOpen ? 'block' : 'hidden'}`}>
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h3 className="text-xl font-semibold text-foreground flex items-center">
              <Folder className="h-5 w-5 text-primary mr-2" />
              Files
            </h3>
            <Button variant="ghost" size="sm" className="p-1 rounded-full hover:bg-[#1a1c23]" title="Upload folder">
              <Circle className="h-4 w-4" />
            </Button>
          </div>
          <ScrollArea className="h-[calc(100vh-4rem)]">
            <div className="p-2">
              {files?.length ? renderTree(fileTree) : (
                <div className="flex flex-col items-center justify-center p-6 text-center">
                  <FileSymlink className="h-10 w-10 text-muted-foreground mb-2 opacity-50" />
                  <p className="text-sm text-muted-foreground italic">No files available</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    );
  });

  const UploadDialog = memo(() => (
    <Dialog open={state.showUploadDialog} onOpenChange={(open) => setState(prev => ({ ...prev, showUploadDialog: open }))}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary" />
            Upload Code Folder
          </DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
            <Input
              type="file"
              webkitdirectory="true"
              directory=""
              multiple
              onChange={handleFolderUpload}
              className="w-full opacity-0 absolute inset-0 cursor-pointer"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm font-medium">Drag & drop a folder or click to browse</p>
              <p className="text-xs text-muted-foreground mt-1">All code files will be imported</p>
            </label>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  ));

  const RepoStats = memo(({ repo }) => {
    if (!repo?.files?.length) return null;

    const fileExtensions = groupFilesByExtension(repo.files);
    const totalSize = repo.files.reduce((acc, file) => acc + (file.size || 0), 0);

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card className="overflow-hidden border border-border">
          <CardContent className="p-4">
            <h3 className="text-sm font-medium flex items-center mb-3">
              <Info className="h-4 w-4 mr-2 text-primary" />
              Repository Overview
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Files</span>
                <span className="font-medium">{repo.files.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Size</span>
                <span className="font-medium">{formatFileSize(totalSize)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Update</span>
                <span className="font-medium">{formatDate(repo.updatedAt) || "N/A"}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="overflow-hidden border border-border">
          <CardContent className="p-4">
            <h3 className="text-sm font-medium flex items-center mb-3">
              <FileCheck className="h-4 w-4 mr-2 text-primary" />
              File Types
            </h3>
            <div className="flex flex-wrap gap-2">
              {Object.entries(fileExtensions)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 8)
                .map(([ext, count]) => (
                  <Badge key={ext} variant="outline" className="text-xs">
                    {ext} ({count})
                  </Badge>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  });

  return (
    <Suspense fallback={<LoadingAnimation />}>
      <div className="flex h-screen bg-background">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="fixed top-4 left-4 z-20 md:hidden p-2 rounded-full bg-background shadow-md hover:shadow-lg transition-all"
        >
          {isSidebarOpen ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
        </Button>

        {state.isLoading && !state.hasFetched ? (
          <>
            <SidebarSkeleton />
            <div className="flex-1 flex flex-col min-w-0">
              <HeaderSkeleton />
              <MainSkeleton />
              <FooterSkeleton />
            </div>
          </>
        ) : (
          <>
            <FileExplorer files={state.repo?.files} />
            <div className="flex-1 flex flex-col min-w-0">
              {state.errors.fetch ? (
                <div className="flex-1 flex items-center justify-center p-4">
                  <Alert variant="destructive" className="max-w-md w-full">
                    <AlertDescription className="flex items-center justify-between gap-4">
                      <span>{state.errors.fetch}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchRepoData(true)}
                        className="bg-background hover:bg-[#1a1c23] text-foreground border-primary hover:border-primary/80 transition-colors duration-200"
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Retry
                      </Button>
                    </AlertDescription>
                  </Alert>
                </div>
              ) : state.repo ? (
                <>
                  <header className="border-b border-border p-4 flex items-center justify-between bg-background shrink-0 sticky top-0 z-10 shadow-sm">
                    <div className="flex items-center gap-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/project/${state.projectId}`)}
                        className="text-muted-foreground hover:text-foreground p-1 rounded-full"
                        title="Back to project"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </Button>
                      <h1 className="text-lg font-medium text-foreground truncate flex items-center">
                        {state.repo.name || 'Unnamed Repository'}
                        {state.repo.source === "github" && (
                          <Badge variant="outline" className="ml-2 text-xs">GitHub</Badge>
                        )}
                        {state.repo.source === "local" && (
                          <Badge variant="outline" className="ml-2 text-xs">Local</Badge>
                        )}
                      </h1>
                    </div>
                    <div className="flex items-center gap-2">
                      {state.repo.repo_url && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(state.repo.repo_url, '_blank')}
                          className="text-muted-foreground hover:text-foreground p-1 rounded-full"
                          title="Visit repository"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => fetchRepoData(true)}
                        className="text-muted-foreground hover:text-foreground p-1 rounded-full"
                        title="Refresh"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                  </header>

                  <main className="flex-1 overflow-y-auto p-6">
                    <div className="space-y-6 max-w-4xl mx-auto">
                      <section>
                        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                          <Info className="h-5 w-5 mr-2 text-primary" />
                          Repository Details
                        </h2>
                        <RepoStats repo={state.repo} />
                        <Card className="overflow-hidden border border-border">
                          <CardContent className="p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
                              <div className="space-y-3">
                                <div className="flex items-start gap-2">
                                  <span className="font-medium text-foreground w-20 flex-shrink-0">Source:</span>
                                  <span className="text-muted-foreground capitalize">{state.repo.source || "N/A"}</span>
                                </div>
                                <div className="flex items-start gap-2">
                                  <span className="font-medium text-foreground w-20 flex-shrink-0">URL:</span>
                                  <span className="text-muted-foreground break-all flex items-center gap-2">
                                    {state.repo.repo_url ? (
                                      <a href={state.repo.repo_url} target="_blank" rel="noopener noreferrer" className="hover:underline truncate flex items-center gap-2">
                                        <ExternalLink className="h-4 w-4 flex-shrink-0 text-primary" />
                                        {state.repo.repo_url}
                                      </a>
                                    ) : "N/A"}
                                  </span>
                                </div>
                              </div>
                              <div className="space-y-3">
                                <div className="flex items-start gap-2">
                                  <span className="font-medium text-foreground w-20 flex-shrink-0">Created:</span>
                                  <span className="text-muted-foreground flex items-center gap-2">
                                    {formatDate(state.repo.created_at) || "N/A"}
                                    <Calendar className="h-4 w-4 text-primary" />
                                  </span>
                                </div>
                                <div className="flex items-start gap-2">
                                  <span className="font-medium text-foreground w-20 flex-shrink-0">Updated:</span>
                                  <span className="text-muted-foreground flex items-center gap-2">
                                    {formatDate(state.repo.updatedAt) || "N/A"}
                                    <Calendar className="h-4 w-4 text-primary" />
                                  </span>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </section>

                      {state.selectedFile && (
                        <section className="bg-[#1a1c23] p-4 rounded-md border border-border">
                          <h3 className="text-sm font-semibold mb-2 flex items-center">
                            <File className="h-4 w-4 mr-2 text-primary" />
                            Selected File: {state.selectedFile}
                          </h3>
                        </section>
                      )}

                      <FileTree3DVisualization fileTree={buildFileTree(state.repo.name, state.repo.files)} />
                    </div>
                  </main>

                  <footer className="shrink-0 h-8 border-t border-border bg-[#1a1c23] flex items-center px-4 justify-between text-xs text-muted-foreground shadow-inner">
                    <div className="flex items-center gap-1">
                      <FileCheck className="h-3.5 w-3.5" />
                      <span>{state.repo.files?.length || 0} files</span>
                    </div>
                    <span>Updated {formatDate(state.repo.updatedAt) || "N/A"}</span>
                  </footer>
                </>
              ) : null}
            </div>
          </>
        )}
        <UploadDialog />
      </div>
    </Suspense>
  );
});

export default RepoPage;