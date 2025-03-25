/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback, memo, Suspense, useMemo } from "react";
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
  Loader2,
  Minimize,
  Maximize,
  X,
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

// Types for cached data
interface RepoData {
  id: string;
  name: string;
  project_id: string;
  source: "github" | "local";
  repo_url?: string;
  created_at: number;
  updatedAt?: number;
  files: FileData[];
}

interface FileData {
  path: string;
  size?: number;
  modified?: string;
}

// Unified cache for all API responses
const repoPageCache = new Map<string, any>();

// Format file size
const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
};

// Build file tree
interface FileTreeNode {
  name: string;
  children: FileTreeNode[];
  isFolder: boolean;
  size?: number;
  modified?: string;
}

const buildFileTree = (repoName: string, files: FileData[] = []): FileTreeNode => {
  const tree: FileTreeNode = { name: repoName || "Unnamed Repository", children: [], isFolder: true };
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
const groupFilesByExtension = (files: FileData[] = []): Record<string, number> => {
  const groups: Record<string, number> = {};
  files.forEach(file => {
    if (!file?.path) return;
    const extension = file.path.split('.').pop()?.toLowerCase() || 'other';
    groups[extension] = (groups[extension] || 0) + 1;
  });
  return groups;
};

// Skeleton Loaders
const Skeleton = ({ className }: { className: string }) => (
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

// 3D Visualization Component (unchanged except for type annotations)
const FileTree3DVisualization = memo(({ fileTree }: { fileTree: FileTreeNode }) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [nodeCount, setNodeCount] = useState(0);
  const [autoRotate, setAutoRotate] = useState(false);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const nodesMap = useMemo(() => new Map<string, any>(), []);

  const totalNodes = useMemo(() => {
    const countNodes = (node: FileTreeNode): number => {
      let count = 1;
      if (node.isFolder && node.children) {
        node.children.forEach(child => (count += countNodes(child)));
      }
      return count;
    };
    return countNodes(fileTree);
  }, [fileTree]);

  useEffect(() => {
    if (!mountRef.current || !fileTree) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111827);
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 0, 40);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    controls.enableZoom = true;
    controls.autoRotate = autoRotate;
    controls.autoRotateSpeed = 0.5;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 10, 10);
    scene.add(directionalLight);

    const nodes: any[] = [];
    const links: any[] = [];
    setNodeCount(totalNodes);

    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x555555,
      transparent: true,
      opacity: 0.6
    });

    const createTextSprite = (text: string, fontSize: number): THREE.Sprite => {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d')!;
      canvas.width = 300;
      canvas.height = 64;
      context.fillStyle = 'rgba(0, 0, 0, 0)';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.font = `${fontSize}px Arial`;
      context.fillStyle = '#ffffff';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText(text.length > 15 ? text.substring(0, 12) + '...' : text, canvas.width / 2, canvas.height / 2);
      const texture = new THREE.CanvasTexture(canvas);
      const spriteMaterial = new THREE.SpriteMaterial({ map: texture, transparent: true });
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.scale.set(2, 0.5, 1);
      return sprite;
    };

    const getNodeColor = (node: FileTreeNode, depth: number): number => {
      const colorSchemes = [
        { folder: 0x68b0ab, file: 0x8fc0a9 },
        { folder: 0xc8553d, file: 0xf28f3b },
        { folder: 0x588b8b, file: 0xffd5c2 },
        { folder: 0xf2d0a4, file: 0xf1e3d3 },
        { folder: 0xd88c9a, file: 0xf2d0a9 }
      ];
      const colorIndex = depth % colorSchemes.length;
      return node.isFolder ? colorSchemes[colorIndex].folder : colorSchemes[colorIndex].file;
    };

    const getRelatedNodes = (nodeObj: any): Set<string> => {
      const related = new Set<string>();
      related.add(nodeObj.mesh.uuid);
      let current = nodeObj;
      while (current.parent) {
        related.add(current.parent.mesh.uuid);
        current = current.parent;
      }
      const addDescendants = (node: any) => {
        if (!node) return;
        node.children.forEach((child: any) => {
          related.add(child.mesh.uuid);
          addDescendants(child);
        });
      };
      addDescendants(nodeObj);
      if (nodeObj.parent) {
        nodeObj.parent.children.forEach((sibling: any) => {
          related.add(sibling.mesh.uuid);
        });
      }
      return related;
    };

    const processNode = (node: FileTreeNode, parent: any = null, depth: number = 0): any => {
      const radius = node.isFolder ? 0.8 : 0.5;
      const geometry = new THREE.SphereGeometry(radius, 16, 16);
      const nodeColor = getNodeColor(node, depth);
      const material = new THREE.MeshPhongMaterial({
        color: nodeColor,
        transparent: true,
        opacity: 0.85,
        shininess: 30
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.userData.originalColor = nodeColor;

      const sprite = createTextSprite(node.name, node.isFolder ? 60 : 40);
      sprite.position.set(0, radius + 0.5, 0);
      mesh.add(sprite);

      mesh.userData = { ...mesh.userData, name: node.name, isFolder: node.isFolder, depth, children: [] };

      const phi = Math.acos(-1 + 2 * Math.random());
      const theta = Math.random() * Math.PI * 2;
      const radius2 = depth * 5 + Math.random() * 5;
      const x = radius2 * Math.sin(phi) * Math.cos(theta);
      const y = radius2 * Math.sin(phi) * Math.sin(theta);
      const z = radius2 * Math.cos(phi);

      const nodeObj = {
        mesh,
        x, y, z,
        vx: 0, vy: 0, vz: 0,
        depth,
        isFolder: node.isFolder,
        children: [],
        parent: parent ? parent.mesh : null
      };

      nodes.push(nodeObj);
      nodesMap.set(mesh.uuid, nodeObj);
      scene.add(mesh);

      if (parent) {
        const link = { source: nodesMap.get(parent.mesh.uuid), target: nodeObj };
        links.push(link);
        const points = [
          new THREE.Vector3(parent.mesh.position.x, parent.mesh.position.y, parent.mesh.position.z),
          new THREE.Vector3(mesh.position.x, mesh.position.y, mesh.position.z)
        ];
        const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(lineGeometry, lineMaterial);
        line.userData = { sourceId: parent.mesh.uuid, targetId: mesh.uuid };
        scene.add(line);
        link.line = line;
        if (parent) {
          nodeObj.parent = nodesMap.get(parent.mesh.uuid);
          nodesMap.get(parent.mesh.uuid).children.push(nodeObj);
        }
      }

      if (node.isFolder && node.children) {
        node.children.forEach(child => processNode(child, nodeObj, depth + 1));
      }

      return nodeObj;
    };

    const rootNode = processNode(fileTree);

    const applyForces = (): number => {
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const nodeA = nodes[i];
          const nodeB = nodes[j];
          const dx = nodeB.x - nodeA.x;
          const dy = nodeB.y - nodeA.y;
          const dz = nodeB.z - nodeA.z;
          const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
          if (distance === 0) continue;
          const repulsionStrength = 5;
          let repulsion = repulsionStrength / (distance * distance);
          if (nodeA.depth !== nodeB.depth) repulsion *= 0.5;
          const forceX = dx / distance * repulsion;
          const forceY = dy / distance * repulsion;
          const forceZ = dz / distance * repulsion;
          nodeA.vx -= forceX;
          nodeA.vy -= forceY;
          nodeA.vz -= forceZ;
          nodeB.vx += forceX;
          nodeB.vy += forceY;
          nodeB.vz += forceZ;
        }
      }

      links.forEach(link => {
        const dx = link.target.x - link.source.x;
        const dy = link.target.y - link.source.y;
        const dz = link.target.z - link.source.z;
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (distance === 0) return;
        const idealDistance = 3 + Math.abs(link.target.depth - link.source.depth) * 2;
        const springForce = (distance - idealDistance) * 0.05;
        const forceX = dx / distance * springForce;
        const forceY = dy / distance * springForce;
        const forceZ = dz / distance * springForce;
        link.source.vx += forceX;
        link.source.vy += forceY;
        link.source.vz += forceZ;
        link.target.vx -= forceX;
        link.target.vy -= forceY;
        link.target.vz -= forceZ;
      });

      let centerX = 0, centerY = 0, centerZ = 0;
      nodes.forEach(node => {
        centerX += node.x;
        centerY += node.y;
        centerZ += node.z;
      });
      centerX /= nodes.length;
      centerY /= nodes.length;
      centerZ /= nodes.length;

      nodes.forEach(node => {
        node.vx -= centerX * 0.01;
        node.vy -= centerY * 0.01;
        node.vz -= centerZ * 0.01;
      });

      let totalMovement = 0;
      nodes.forEach(node => {
        node.x += node.vx;
        node.y += node.vy;
        node.z += node.vz;
        node.vx *= 0.9;
        node.vy *= 0.9;
        node.vz *= 0.9;
        node.mesh.position.set(node.x, node.y, node.z);
        totalMovement += Math.abs(node.vx) + Math.abs(node.vy) + Math.abs(node.vz);
      });

      links.forEach(link => {
        const points = [
          new THREE.Vector3(link.source.x, link.source.y, link.source.z),
          new THREE.Vector3(link.target.x, link.target.y, link.target.z)
        ];
        link.line.geometry.dispose();
        link.line.geometry = new THREE.BufferGeometry().setFromPoints(points);
      });

      if (isLoading && totalMovement < 0.05) {
        setIsLoading(false);
      }

      return totalMovement;
    };

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleNodeClick = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children.filter(obj => obj.type === 'Mesh'));
      if (intersects.length > 0) {
        const clickedNode = nodesMap.get(intersects[0].object.uuid);
        if (clickedNode) {
          if (selectedNode === clickedNode.mesh.uuid) {
            setSelectedNode(null);
            resetAllNodesVisibility();
          } else {
            setSelectedNode(clickedNode.mesh.uuid);
            highlightRelatedNodes(clickedNode);
          }
        }
      }
    };

    const highlightRelatedNodes = (nodeObj: any) => {
      const relatedNodes = getRelatedNodes(nodeObj);
      nodes.forEach(node => {
        if (relatedNodes.has(node.mesh.uuid)) {
          node.mesh.material.opacity = 1.0;
          if (node.mesh.uuid === nodeObj.mesh.uuid) {
            node.mesh.material.emissive = new THREE.Color(0x333333);
            node.mesh.material.emissiveIntensity = 0.5;
            node.mesh.scale.set(1.2, 1.2, 1.2);
          } else {
            node.mesh.material.emissive = new THREE.Color(0x111111);
            node.mesh.material.emissiveIntensity = 0.2;
            node.mesh.scale.set(1, 1, 1);
          }
        } else {
          node.mesh.material.opacity = 0.15;
          node.mesh.material.emissive = new THREE.Color(0x000000);
          node.mesh.material.emissiveIntensity = 0;
          node.mesh.scale.set(0.8, 0.8, 0.8);
        }
      });
      links.forEach(link => {
        const isRelatedLink = relatedNodes.has(link.source.mesh.uuid) && relatedNodes.has(link.target.mesh.uuid);
        link.line.material.opacity = isRelatedLink ? 0.8 : 0.1;
        link.line.material.color.set(isRelatedLink ? 0x777777 : 0x555555);
      });
    };

    const resetAllNodesVisibility = () => {
      nodes.forEach(node => {
        node.mesh.material.opacity = 0.85;
        node.mesh.material.emissive = new THREE.Color(0x000000);
        node.mesh.material.emissiveIntensity = 0;
        node.mesh.scale.set(1, 1, 1);
      });
      links.forEach(link => {
        link.line.material.opacity = 0.6;
        link.line.material.color.set(0x555555);
      });
    };

    renderer.domElement.addEventListener('click', handleNodeClick);

    const animate = () => {
      requestAnimationFrame(animate);
      if (isLoading || autoRotate) applyForces();
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!mountRef.current || !sceneRef.current) return;
      const width = document.fullscreenElement ? window.innerWidth : mountRef.current.clientWidth;
      const height = document.fullscreenElement ? window.innerHeight : mountRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    sceneRef.current = { scene, camera, controls, renderer, resetAllNodesVisibility };
    window.addEventListener('resize', handleResize);
    document.addEventListener('fullscreenchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('fullscreenchange', handleResize);
      renderer.domElement.removeEventListener('click', handleNodeClick);
      scene.traverse(obj => {
        if (obj instanceof THREE.Object3D) {
          if ((obj as any).geometry) (obj as any).geometry.dispose();
          if ((obj as any).material) {
            if (Array.isArray((obj as any).material)) {
              (obj as any).material.forEach((m: any) => m.dispose());
            } else {
              (obj as any).material.dispose();
            }
          }
        }
      });
      renderer.dispose();
      if (mountRef.current && mountRef.current.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [fileTree, autoRotate]);

  useEffect(() => {
    if (!selectedNode && sceneRef.current?.resetAllNodesVisibility) {
      sceneRef.current.resetAllNodesVisibility();
    }
  }, [selectedNode]);

  const toggleFullScreen = () => {
    const elem = mountRef.current;
    if (!elem) return;
    if (!document.fullscreenElement) {
      elem.requestFullscreen().catch(err => toast.error(`Error enabling fullscreen: ${err.message}`));
    } else {
      document.exitFullscreen();
    }
  };

  const toggleAutoRotate = () => setAutoRotate(prev => !prev);

  const handleReset = () => {
    if (sceneRef.current?.controls) {
      sceneRef.current.controls.reset();
    }
    setSelectedNode(null);
  };

  const handleZoomIn = useCallback(() => {
    if (sceneRef.current?.camera) {
      sceneRef.current.camera.position.z = Math.max(sceneRef.current.camera.position.z - 5, 10);
      sceneRef.current.controls.update();
    }
  }, []);

  const handleZoomOut = useCallback(() => {
    if (sceneRef.current?.camera) {
      sceneRef.current.camera.position.z = Math.min(sceneRef.current.camera.position.z + 5, 100);
      sceneRef.current.controls.update();
    }
  }, []);

  return (
    <Card className="w-full overflow-hidden border border-border shadow-lg relative">
      <CardHeader className="p-4 border-b border-border flex justify-between items-center">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Layers className="h-4 w-4 text-primary" />
          Interactive File Structure
          {isLoading && <span className="text-xs text-muted-foreground animate-pulse">Organizing ({nodeCount} nodes)</span>}
          {selectedNode && <span className="text-xs text-primary ml-2">(Node selected)</span>}
        </CardTitle>
        <div className="flex items-center gap-2">
          {selectedNode && (
            <Button
              variant="outline"
              size="sm"
              className="text-xs flex items-center gap-1 h-7"
              onClick={() => setSelectedNode(null)}
            >
              <X className="h-3 w-3" /> Clear Selection
            </Button>
          )}
          <Badge variant="outline" className="text-xs">{nodeCount} items</Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0 relative">
        <div ref={mountRef} className="w-full h-[600px] bg-[#111827]" />
        <div className="absolute bottom-4 left-4 flex gap-2 bg-background/80 p-2 rounded-lg shadow-md">
          <Button
            variant="secondary"
            size="sm"
            className="w-8 h-8 p-0 rounded-full"
            onClick={toggleFullScreen}
            title="Toggle fullscreen"
          >
            {document.fullscreenElement ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          </Button>
          {!document.fullscreenElement && (
            <>
              <Button
                variant="secondary"
                size="sm"
                className="w-8 h-8 p-0 rounded-full"
                onClick={toggleAutoRotate}
                title="Toggle auto simulation"
              >
                <RefreshCw className={`h-4 w-4 ${autoRotate ? 'text-primary animate-spin' : ''}`} />
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="w-8 h-8 p-0 rounded-full"
                onClick={handleReset}
                title="Reset view"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="w-8 h-8 p-0 rounded-full"
                onClick={handleZoomIn}
                title="Zoom in"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="w-8 h-8 p-0 rounded-full"
                onClick={handleZoomOut}
                title="Zoom out"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
        {document.fullscreenElement && (
          <div className="fixed top-4 right-4 z-50">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => document.exitFullscreen()}
              className="flex items-center gap-2 bg-background/80 rounded-lg shadow-md"
            >
              <span>ESC</span>
              <Minimize className="h-4 w-4" />
            </Button>
          </div>
        )}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">
                Simulating {nodeCount} nodes...
              </span>
            </div>
          </div>
        )}
      </CardContent>
      {selectedNode && (
        <div className="absolute top-4 right-4 bg-background/90 p-2 rounded-lg shadow-md max-w-xs">
          <p className="text-xs text-muted-foreground">
            Selected: {nodesMap.get(selectedNode)?.mesh.userData.name}
          </p>
          <p className="text-xs text-muted-foreground">
            Type: {nodesMap.get(selectedNode)?.mesh.userData.isFolder ? 'Folder' : 'File'}
          </p>
          <p className="text-xs text-muted-foreground">
            Depth: {nodesMap.get(selectedNode)?.mesh.userData.depth}
          </p>
        </div>
      )}
    </Card>
  );
});

FileTree3DVisualization.displayName = 'FileTree3DVisualization';

const RepoPage = memo(() => {
  const { id: repoId } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [state, setState] = useState<{
    projectId: string;
    repo: RepoData | null;
    isLoading: boolean;
    errors: Record<string, string>;
    hasFetched: boolean;
    uploadedFiles: FileData[];
    showUploadDialog: boolean;
    selectedFile: string | null;
    expandedFolders: Set<string>;
  }>({
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

  const validateToken = useCallback((): boolean => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return false;
    }
    return true;
  }, [navigate]);

  const fetchRepoData = useCallback(async (force = false) => {
    if (!validateToken() || !repoId) return;

    const repoCacheKey = `${repoId}:repo`;
    const filesCacheKey = `${repoId}:files`;
    const cachedRepo = repoPageCache.get(repoCacheKey) as RepoData | undefined;
    const cachedFiles = repoPageCache.get(filesCacheKey) as FileData[] | undefined;

    if (!force && cachedRepo && cachedFiles) {
      setState(prev => ({
        ...prev,
        repo: { ...cachedRepo, files: cachedFiles },
        projectId: cachedRepo.project_id || '',
        isLoading: false,
        hasFetched: true,
        expandedFolders: new Set([cachedRepo.name || "Unnamed Repository"]),
        showUploadDialog: cachedRepo.source === "local" && !cachedFiles.length,
      }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const [repoData, filesData] = await Promise.all([
        apiMethods.getRepository(repoId),
        apiMethods.listRepofiles(repoId).catch(() => ({ files: [] })),
      ]);

      const updatedFiles = Array.isArray(filesData?.files) ? filesData.files : [];
      const updatedRepo: RepoData = {
        ...repoData,
        files: updatedFiles,
      };

      repoPageCache.set(repoCacheKey, { ...updatedRepo, files: [] }); // Store repo without files
      repoPageCache.set(filesCacheKey, updatedFiles);

      setState(prev => ({
        ...prev,
        repo: updatedRepo,
        projectId: updatedRepo.project_id || '',
        isLoading: false,
        hasFetched: true,
        expandedFolders: new Set([updatedRepo.name || "Unnamed Repository"]),
        showUploadDialog: updatedRepo.source === "local" && !updatedFiles.length,
      }));
    } catch (err) {
      setState(prev => ({
        ...prev,
        errors: { ...prev.errors, fetch: err instanceof Error ? err.message : "Error fetching repository" },
        isLoading: false,
        hasFetched: true,
      }));
      toast.error("Failed to load repository data");
    }
  }, [repoId, validateToken]);

  const handleFolderUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    const fileList: FileData[] = files.map(file => ({
      path: file.webkitRelativePath || file.name,
      size: file.size,
      modified: file.lastModified ? new Date(file.lastModified).toISOString() : new Date().toISOString(),
    }));

    const filesCacheKey = `${repoId}:files`;
    repoPageCache.set(filesCacheKey, fileList);

    setState(prev => ({
      ...prev,
      uploadedFiles: fileList,
      repo: prev.repo ? { ...prev.repo, files: fileList } : prev.repo,
      showUploadDialog: false,
    }));
    toast.success("Folder uploaded successfully");
  }, [repoId]);

  useEffect(() => {
    if (!state.hasFetched && repoId) {
      fetchRepoData();
    }
  }, [fetchRepoData, state.hasFetched, repoId]);

  const FileExplorer = memo(({ files }: { files: FileData[] }) => {
    const fileTree = buildFileTree(state.repo?.name || "Unnamed Repository", files);

    const toggleFolder = useCallback((path: string) => {
      setState(prev => {
        const newExpanded = new Set(prev.expandedFolders);
        newExpanded.has(path) ? newExpanded.delete(path) : newExpanded.add(path);
        return { ...prev, expandedFolders: newExpanded };
      });
    }, []);

    const getFileIcon = useCallback(() => (
      <File className="h-4 w-4 text-primary flex-shrink-0" />
    ), []);

    const renderTree = useCallback((node: FileTreeNode, path: string) => (
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
              {getFileIcon()}
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
              {files?.length ? renderTree(fileTree, state.repo?.name || "Unnamed Repository") : (
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

  const RepoStats = memo(({ repo }: { repo: RepoData }) => {
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
      <div className="flex h-screen bg-background overflow-hidden mt-4">
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
            <div className="flex-1 flex flex-col min-w-0 h-full">
              <HeaderSkeleton />
              <MainSkeleton />
              <FooterSkeleton />
            </div>
          </>
        ) : (
          <>
            <FileExplorer files={state.repo?.files || []} />
            <div className="flex-1 flex flex-col min-w-0 h-full">
              {state.errors.fetch ? (
                <div className="flex-1 flex items-center justify-center p-6">
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
                  <header className="border-b border-border px-6 py-4 flex items-center justify-between bg-background shrink-0 sticky top-0 z-10 shadow-sm">
                    <div className="flex items-center gap-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/project/${state.projectId}`)}
                        className="text-muted-foreground hover:text-foreground p-1 rounded-full"
                        title="Back to project"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </Button>
                      <h1 className="text-lg font-medium text-foreground truncate flex items-center gap-2">
                        {state.repo.name || 'Unnamed Repository'}
                        {state.repo.source === "github" && (
                          <Badge variant="outline" className="text-xs">GitHub</Badge>
                        )}
                        {state.repo.source === "local" && (
                          <Badge variant="outline" className="text-xs">Local</Badge>
                        )}
                      </h1>
                    </div>
                    <div className="flex items-center gap-3">
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
                  <main className="flex-1 overflow-y-auto px-6 py-8">
                    <div className="space-y-8 max-w-4xl mx-auto">
                      <section className="space-y-6">
                        <div className="space-y-4">
                          <h2 className="text-lg font-semibold text-foreground flex items-center">
                            <Info className="h-5 w-5 mr-2 text-primary" />
                            Repository Details
                          </h2>
                          <RepoStats repo={state.repo} />
                          <Card className="overflow-hidden border border-border">
                            <CardContent className="p-6">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                                <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <span className="font-medium text-foreground w-20 flex-shrink-0">Created:</span>
                                    <span className="text-muted-foreground flex items-center gap-2">
                                      {formatDate(state.repo.created_at) || "N/A"}
                                      <Calendar className="h-4 w-4 text-primary" />
                                    </span>
                                  </div>
                                  
                                </div>
                                <div className="space-y-4">
                                  
                                  <div className="flex items-start gap-3">
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
                        </div>
                        {/* <FileTree3DVisualization fileTree={buildFileTree(state.repo.name, state.repo.files)} /> */}

                      </section>

                      {state.selectedFile && (
                        <section className="bg-[#1a1c23] p-4 rounded-md border border-border">
                          <h3 className="text-sm font-semibold flex items-center">
                            <File className="h-4 w-4 mr-2 text-primary" />
                            Selected File: {state.selectedFile}
                          </h3>
                        </section>
                      )}
                    </div>
                  </main>
                  <footer className="shrink-0 h-10 border-t border-border bg-[#1a1c23] flex items-center px-6 justify-between text-xs text-muted-foreground shadow-inner -mb-2">
                    <div className="flex items-center gap-2">
                      <FileCheck className="h-3.5 w-3.5" />
                      <span>{state.repo.files?.length || 0} files</span>
                    </div>
                    <span>Updated {formatDate(state.repo.updatedAt) || "N/A"}</span>
                  </footer>
                </>
              ) : null}
            </div>
            <UploadDialog />
          </>
        )}
      </div>
    </Suspense>
  );
});

export default RepoPage;