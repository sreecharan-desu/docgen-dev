import React, { useState, useEffect, useCallback, memo, Suspense } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import {
  Plus, FolderKanban, AlertCircle, Clock, Users, GitBranch, Search, X, MoreVertical,
  Pencil, Trash2, ChevronLeft, RefreshCw, Loader, Download, FolderUp, Folder, FolderSearch,
  Eye, Github, Lock,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useDebounce } from "use-debounce";
import { apiMethods, BASE_URL } from "@/utils/apis";
import { deepEqual, formatDate } from "@/utils/functions";

const cache = {
  project: new Map(),
  repositories: new Map(),
  githubRepos: null,
  githubAccess: null
};

// Lazy-loaded components
const Button = React.lazy(() => import("@/components/ui/button").then(mod => ({ default: mod.Button })));
const Input = React.lazy(() => import("@/components/ui/input").then(mod => ({ default: mod.Input })));
const Label = React.lazy(() => import("@/components/ui/label").then(mod => ({ default: mod.Label })));
const Card = React.lazy(() => import("@/components/ui/card").then(mod => ({ default: mod.Card })));
const CardContent = React.lazy(() => import("@/components/ui/card").then(mod => ({ default: mod.CardContent })));
const CardHeader = React.lazy(() => import("@/components/ui/card").then(mod => ({ default: mod.CardHeader })));
const CardTitle = React.lazy(() => import("@/components/ui/card").then(mod => ({ default: mod.CardTitle })));
const CardFooter = React.lazy(() => import("@/components/ui/card").then(mod => ({ default: mod.CardFooter })));
const Dialog = React.lazy(() => import("@/components/ui/dialog").then(mod => ({ default: mod.Dialog })));
const DialogContent = React.lazy(() => import("@/components/ui/dialog").then(mod => ({ default: mod.DialogContent })));
const DialogHeader = React.lazy(() => import("@/components/ui/dialog").then(mod => ({ default: mod.DialogHeader })));
const DialogTitle = React.lazy(() => import("@/components/ui/dialog").then(mod => ({ default: mod.DialogTitle })));
const DialogFooter = React.lazy(() => import("@/components/ui/dialog").then(mod => ({ default: mod.DialogFooter })));
const DialogClose = React.lazy(() => import("@/components/ui/dialog").then(mod => ({ default: mod.DialogClose })));
const Alert = React.lazy(() => import("@/components/ui/alert").then(mod => ({ default: mod.Alert })));
const AlertDescription = React.lazy(() => import("@/components/ui/alert").then(mod => ({ default: mod.AlertDescription })));
const Badge = React.lazy(() => import("@/components/ui/badge").then(mod => ({ default: mod.Badge })));
const DropdownMenu = React.lazy(() => import("@/components/ui/dropdown-menu").then(mod => ({ default: mod.DropdownMenu })));
const DropdownMenuTrigger = React.lazy(() => import("@/components/ui/dropdown-menu").then(mod => ({ default: mod.DropdownMenuTrigger })));
const DropdownMenuContent = React.lazy(() => import("@/components/ui/dropdown-menu").then(mod => ({ default: mod.DropdownMenuContent })));
const DropdownMenuItem = React.lazy(() => import("@/components/ui/dropdown-menu").then(mod => ({ default: mod.DropdownMenuItem })));
const DropdownMenuSeparator = React.lazy(() => import("@/components/ui/dropdown-menu").then(mod => ({ default: mod.DropdownMenuSeparator })));
const Tabs = React.lazy(() => import("@/components/ui/tabs").then(mod => ({ default: mod.Tabs })));
const TabsList = React.lazy(() => import("@/components/ui/tabs").then(mod => ({ default: mod.TabsList })));
const TabsTrigger = React.lazy(() => import("@/components/ui/tabs").then(mod => ({ default: mod.TabsTrigger })));
const TabsContent = React.lazy(() => import("@/components/ui/tabs").then(mod => ({ default: mod.TabsContent })));
const Progress = React.lazy(() => import("@/components/ui/progress").then(mod => ({ default: mod.Progress })));

export {
  React, useState, useEffect, useCallback, memo, Suspense, useParams, useLocation, useNavigate,
  Plus, FolderKanban, AlertCircle, Clock, Users, GitBranch, Search, X, MoreVertical, Pencil,
  Trash2, ChevronLeft, RefreshCw, Loader, Download, FolderUp, Folder, FolderSearch, Eye, Github,
  Lock, useAuth, toast, useDebounce, apiMethods, BASE_URL, deepEqual, formatDate, cache,
  Button, Input, Label, Card, CardContent, CardHeader, CardTitle, CardFooter, Dialog,
  DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, Alert, AlertDescription,
  Badge, DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, Tabs, TabsList, TabsTrigger, TabsContent, Progress
};