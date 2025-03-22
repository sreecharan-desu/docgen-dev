import React from "react";

// Lazy-loaded component imports
export const UI = {
  Button: React.lazy(() => import("@/components/ui/button").then(mod => ({ default: mod.Button }))),
  Input: React.lazy(() => import("@/components/ui/input").then(mod => ({ default: mod.Input }))),
  Label: React.lazy(() => import("@/components/ui/label").then(mod => ({ default: mod.Label }))),
  Card: React.lazy(() => import("@/components/ui/card").then(mod => ({ default: mod.Card }))),
  CardContent: React.lazy(() => import("@/components/ui/card").then(mod => ({ default: mod.CardContent }))),
  CardHeader: React.lazy(() => import("@/components/ui/card").then(mod => ({ default: mod.CardHeader }))),
  CardTitle: React.lazy(() => import("@/components/ui/card").then(mod => ({ default: mod.CardTitle }))),
  CardDescription: React.lazy(() => import("@/components/ui/card").then(mod => ({ default: mod.CardDescription }))),
  CardFooter: React.lazy(() => import("@/components/ui/card").then(mod => ({ default: mod.CardFooter }))),
  Dialog: React.lazy(() => import("@/components/ui/dialog").then(mod => ({ default: mod.Dialog }))),
  DialogContent: React.lazy(() => import("@/components/ui/dialog").then(mod => ({ default: mod.DialogContent }))),
  DialogHeader: React.lazy(() => import("@/components/ui/dialog").then(mod => ({ default: mod.DialogHeader }))),
  DialogTitle: React.lazy(() => import("@/components/ui/dialog").then(mod => ({ default: mod.DialogTitle }))),
  DialogFooter: React.lazy(() => import("@/components/ui/dialog").then(mod => ({ default: mod.DialogFooter }))),
  DialogClose: React.lazy(() => import("@/components/ui/dialog").then(mod => ({ default: mod.DialogClose }))),
  Alert: React.lazy(() => import("@/components/ui/alert").then(mod => ({ default: mod.Alert }))),
  AlertDescription: React.lazy(() => import("@/components/ui/alert").then(mod => ({ default: mod.AlertDescription }))),
  Badge: React.lazy(() => import("@/components/ui/badge").then(mod => ({ default: mod.Badge }))),
  DropdownMenu: React.lazy(() => import("@/components/ui/dropdown-menu").then(mod => ({ default: mod.DropdownMenu }))),
  DropdownMenuTrigger: React.lazy(() => import("@/components/ui/dropdown-menu").then(mod => ({ default: mod.DropdownMenuTrigger }))),
  DropdownMenuContent: React.lazy(() => import("@/components/ui/dropdown-menu").then(mod => ({ default: mod.DropdownMenuContent }))),
  DropdownMenuItem: React.lazy(() => import("@/components/ui/dropdown-menu").then(mod => ({ default: mod.DropdownMenuItem }))),
  DropdownMenuSeparator: React.lazy(() => import("@/components/ui/dropdown-menu").then(mod => ({ default: mod.DropdownMenuSeparator })))
};