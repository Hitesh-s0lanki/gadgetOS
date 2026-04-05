# File Explorer — Core Operations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add rename, soft-delete (Trash), per-item context menus, and open-in-app to the File Explorer.

**Architecture:** Convex schema gains a `deletedAt` timestamp field on both `files` and `folders`; new mutations handle rename and soft-delete (with recursive cascade for folders); `folder-view.tsx` wraps each grid item in its own Radix `ContextMenu`; `file-explorer.tsx` routes file clicks to Image Preview or Text Editor based on MIME type; the Text Editor store is extended to accept a `pendingFile` payload so it can open pre-populated.

**Tech Stack:** Next.js 14, Convex (mutations + queries), Radix UI ContextMenu, Zustand, Sonner toasts, TypeScript

---

## File Map

| File | Change |
|------|--------|
| `convex/schema.ts` | Add `deletedAt?: number` to `files` + `folders` |
| `convex/files.ts` | Filter deleted from all queries; add `renameFile`, `softDeleteFile` |
| `convex/folders.ts` | Filter deleted from all queries; add `renameFolder`, `softDeleteFolder` (cascade) |
| `src/hooks/webos/use-text-editor.ts` | Replace `createWindowStore` with custom store supporting `pendingFile` |
| `src/components/webos/apps/text-editor.tsx` | Read `pendingFile` on open; switch notes to `{ id, name, content }[]` |
| `src/components/webos/apps/file-explorer/folder-view.tsx` | Per-item ContextMenus; inline rename state; updated prop types |
| `src/components/webos/apps/file-explorer/file-explorer.tsx` | Import `useTextEditor`; smart `handleFileClick` dispatcher |

---

## Task 1: Schema — add `deletedAt` to files and folders

**Files:**
- Modify: `convex/schema.ts`

- [ ] **Step 1: Add `deletedAt` field to both tables**

Replace the content of `convex/schema.ts` with:

```ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    username: v.string(),
    password: v.string(),
  }).index("by_username", ["username"]),

  folders: defineTable({
    userId: v.id("users"),
    name: v.string(),
    parentId: v.optional(v.id("folders")),
    deletedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_name", ["name"])
    .searchIndex("search_files", {
      searchField: "name",
      filterFields: ["userId"],
    }),

  files: defineTable({
    userId: v.id("users"),
    folderId: v.id("folders"),
    name: v.string(),
    type: v.optional(v.string()),
    size: v.optional(v.string()),
    content: v.optional(v.string()),
    contentUrl: v.optional(v.string()),
    description: v.optional(v.string()),
    vector: v.optional(v.array(v.float64())),
    deletedAt: v.optional(v.number()),
  })
    .index("by_folder", ["folderId"])
    .index("by_user", ["userId"])
    .index("by_name", ["name"])
    .searchIndex("search_files", {
      searchField: "name",
      filterFields: ["userId", "folderId"],
    })
    .vectorIndex("by_vector", {
      vectorField: "vector",
      dimensions: 1536,
      filterFields: ["userId"],
    }),
});
```

- [ ] **Step 2: Verify Convex picks up the schema change**

Run: `npx convex dev` (or check the running dev server)
Expected: No schema errors in the Convex dashboard; both tables now have the `deletedAt` field.

- [ ] **Step 3: Commit**

```bash
git add convex/schema.ts
git commit -m "feat(convex): add deletedAt soft-delete field to files and folders"
```

---

## Task 2: Files mutations — filter queries + renameFile + softDeleteFile

**Files:**
- Modify: `convex/files.ts`

- [ ] **Step 1: Replace `convex/files.ts` with updated version**

```ts
import { Id } from "./_generated/dataModel";
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

const USER_ID = process.env.CONVEX_USER_ID as Id<"users">;

export const getFilesByFolder = query({
  args: { folderId: v.id("folders") },
  handler: async (ctx, { folderId }) => {
    return await ctx.db
      .query("files")
      .withIndex("by_folder", (q) => q.eq("folderId", folderId))
      .filter((q) =>
        q.and(
          q.eq(q.field("userId"), USER_ID),
          q.eq(q.field("deletedAt"), undefined)
        )
      )
      .collect();
  },
});

export const createFile = mutation({
  args: {
    folderId: v.id("folders"),
    name: v.string(),
    contentUrl: v.string(),
    type: v.string(),
    size: v.string(),
    description: v.optional(v.string()),
    content: v.optional(v.string()),
    vector: v.optional(v.array(v.float64())),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("files", { userId: USER_ID, ...args });
  },
});

export const createTextFile = mutation({
  args: {
    folderId: v.id("folders"),
    name: v.string(),
    type: v.string(),
    size: v.string(),
    content: v.string(),
    contentUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("files", {
      userId: USER_ID,
      contentUrl: "",
      ...args,
    });
  },
});

export const searchFiles = query({
  args: { searchTerm: v.string() },
  handler: async (ctx, { searchTerm }) => {
    const results = await ctx.db
      .query("files")
      .withSearchIndex("search_files", (q) =>
        q.search("name", searchTerm).eq("userId", USER_ID)
      )
      .collect();
    return results.filter((f) => f.deletedAt === undefined);
  },
});

export const getFileById = query({
  args: { fileId: v.id("files") },
  handler: async (ctx, { fileId }) => {
    const file = await ctx.db.get(fileId);
    if (!file || file.userId !== USER_ID || file.deletedAt !== undefined) return null;
    return file;
  },
});

export const deleteFile = mutation({
  args: { fileId: v.id("files") },
  handler: async (ctx, { fileId }) => {
    return await ctx.db.delete(fileId);
  },
});

export const renameFile = mutation({
  args: { fileId: v.id("files"), newName: v.string() },
  handler: async (ctx, { fileId, newName }) => {
    await ctx.db.patch(fileId, { name: newName });
  },
});

export const softDeleteFile = mutation({
  args: { fileId: v.id("files") },
  handler: async (ctx, { fileId }) => {
    await ctx.db.patch(fileId, { deletedAt: Date.now() });
  },
});
```

- [ ] **Step 2: Verify in Convex dashboard**

Confirm the new functions appear: `renameFile`, `softDeleteFile`.
Confirm `getFilesByFolder` still returns files (not filtering active ones away).

- [ ] **Step 3: Commit**

```bash
git add convex/files.ts
git commit -m "feat(convex): add renameFile + softDeleteFile; filter deleted from all file queries"
```

---

## Task 3: Folders mutations — filter queries + renameFolder + softDeleteFolder

**Files:**
- Modify: `convex/folders.ts`

- [ ] **Step 1: Replace `convex/folders.ts` with updated version**

```ts
import { Id } from "./_generated/dataModel";
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

const USER_ID = process.env.CONVEX_USER_ID as Id<"users">;

export const getRootFolders = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("folders")
      .withIndex("by_user", (q) => q.eq("userId", USER_ID))
      .filter((q) =>
        q.and(
          q.eq(q.field("parentId"), undefined),
          q.eq(q.field("deletedAt"), undefined)
        )
      )
      .collect();
  },
});

export const getFolders = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("folders")
      .withIndex("by_user", (q) => q.eq("userId", USER_ID))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .collect();
  },
});

export const getFoldersByParent = query({
  args: { parentId: v.id("folders") },
  handler: async (ctx, { parentId }) => {
    return await ctx.db
      .query("folders")
      .withIndex("by_user", (q) => q.eq("userId", USER_ID))
      .filter((q) =>
        q.and(
          q.eq(q.field("parentId"), parentId),
          q.eq(q.field("deletedAt"), undefined)
        )
      )
      .collect();
  },
});

export const getFolderBreadcrumb = query({
  args: { folderId: v.id("folders") },
  handler: async (ctx, { folderId }) => {
    const crumbs: { _id: Id<"folders">; name: string }[] = [];
    let current = await ctx.db.get(folderId);
    while (current) {
      if (current.userId !== USER_ID || current.deletedAt !== undefined) break;
      crumbs.unshift({ _id: current._id, name: current.name });
      if (!current.parentId) break;
      current = await ctx.db.get(current.parentId);
    }
    return crumbs;
  },
});

export const searchFoldersByName = query({
  args: { name: v.string() },
  handler: async (ctx, { name }) => {
    const results = await ctx.db
      .query("folders")
      .withIndex("by_user", (q) => q.eq("userId", USER_ID))
      .filter((q) => q.eq(q.field("name"), name))
      .collect();
    return results.filter((f) => f.deletedAt === undefined);
  },
});

export const createFolder = mutation({
  args: {
    name: v.string(),
    parentId: v.optional(v.id("folders")),
  },
  handler: async (ctx, { name, parentId }) => {
    return await ctx.db.insert("folders", { userId: USER_ID, name, parentId });
  },
});

export const renameFolder = mutation({
  args: { folderId: v.id("folders"), newName: v.string() },
  handler: async (ctx, { folderId, newName }) => {
    await ctx.db.patch(folderId, { name: newName });
  },
});

export const softDeleteFolder = mutation({
  args: { folderId: v.id("folders") },
  handler: async (ctx, { folderId }) => {
    const now = Date.now();

    // BFS: collect this folder + all descendants
    const queue: Id<"folders">[] = [folderId];
    const allFolderIds: Id<"folders">[] = [];

    while (queue.length > 0) {
      const current = queue.shift()!;
      allFolderIds.push(current);
      const children = await ctx.db
        .query("folders")
        .withIndex("by_user", (q) => q.eq("userId", USER_ID))
        .filter((q) => q.eq(q.field("parentId"), current))
        .collect();
      for (const child of children) {
        queue.push(child._id);
      }
    }

    // Soft-delete all folders
    for (const id of allFolderIds) {
      await ctx.db.patch(id, { deletedAt: now });
    }

    // Soft-delete all files in those folders
    for (const id of allFolderIds) {
      const files = await ctx.db
        .query("files")
        .withIndex("by_folder", (q) => q.eq("folderId", id))
        .collect();
      for (const file of files) {
        await ctx.db.patch(file._id, { deletedAt: now });
      }
    }
  },
});
```

- [ ] **Step 2: Verify**

Check the Convex dashboard — `renameFolder` and `softDeleteFolder` should appear.
Existing folder queries should still return folders (no active folders deleted).

- [ ] **Step 3: Commit**

```bash
git add convex/folders.ts
git commit -m "feat(convex): add renameFolder + softDeleteFolder cascade; filter deleted from folder queries"
```

---

## Task 4: Extend Text Editor store to support opening with a file

**Files:**
- Modify: `src/hooks/webos/use-text-editor.ts`

- [ ] **Step 1: Replace the store with a custom Zustand store**

```ts
import { create } from "zustand";

export interface PendingFile {
  name: string;
  content: string;
}

export interface TextEditorStore {
  title: string;
  isOpen: boolean;
  isMinimized: boolean;
  zIndex: number;
  pendingFile: PendingFile | null;
  onOpen: (file?: PendingFile) => void;
  onClose: () => void;
  onMinimize: () => void;
  clearPendingFile: () => void;
}

export const useTextEditor = create<TextEditorStore>((set) => ({
  title: "Text Editor",
  isOpen: false,
  isMinimized: false,
  zIndex: 50,
  pendingFile: null,
  onOpen: (file) =>
    set({ isOpen: true, isMinimized: false, pendingFile: file ?? null }),
  onClose: () => set({ isOpen: false, isMinimized: false, pendingFile: null }),
  onMinimize: () => set({ isMinimized: true }),
  clearPendingFile: () => set({ pendingFile: null }),
}));
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors on `use-text-editor.ts`.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/webos/use-text-editor.ts
git commit -m "feat(text-editor): extend store to accept pendingFile on open"
```

---

## Task 5: Update Text Editor app — named tabs + read pendingFile

**Files:**
- Modify: `src/components/webos/apps/text-editor.tsx`

- [ ] **Step 1: Replace `text-editor.tsx` with updated version**

The key changes:
- Notes become `{ id: string; name: string; content: string }[]` instead of `[string, string][]`
- On first render, if `pendingFile` is set in the store, initialize with it
- Tab labels show `note.name` instead of `Note {idx+1}`
- `handleNew` creates `{ id, name: "Note N", content: "" }`

```tsx
"use client";

import { useState, useEffect } from "react";
import { Plus, Save } from "lucide-react";
import { generateUUID } from "@/lib/utils";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTextEditor } from "@/hooks/webos/use-text-editor";
import { toast } from "sonner";

type Note = { id: string; name: string; content: string };

export default function TextEditorApp() {
  const { onClose, pendingFile, clearPendingFile } = useTextEditor();

  const [notes, setNotes] = useState<Note[]>(() => {
    if (pendingFile) {
      return [{ id: generateUUID(), name: pendingFile.name, content: pendingFile.content }];
    }
    return [{ id: generateUUID(), name: "Note 1", content: "" }];
  });
  const [activeId, setActiveId] = useState(notes[0].id);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogName, setDialogName] = useState("");
  const [dialogFolderId, setDialogFolderId] = useState<string | undefined>();

  // Clear pending file after we've consumed it
  useEffect(() => {
    if (pendingFile) clearPendingFile();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const folders = useQuery(api.folders.getFolders);
  const createFile = useMutation(api.files.createTextFile);

  useEffect(() => {
    if (!folders?.length) return;
    const desktop = folders.find((f) => f.name.toLowerCase() === "desktop");
    Promise.resolve().then(() => setDialogFolderId(desktop?._id ?? folders[0]._id));
  }, [folders]);

  const activeNote = notes.find((n) => n.id === activeId)!;

  const updateContent = (content: string) => {
    setNotes((prev) => prev.map((n) => (n.id === activeId ? { ...n, content } : n)));
  };

  const handleNew = () => {
    const id = generateUUID();
    const name = `Note ${notes.length + 1}`;
    setNotes((prev) => [...prev, { id, name, content: "" }]);
    setActiveId(id);
  };

  const handleSave = async () => {
    if (!dialogName.trim() || !dialogFolderId) return;
    let name = dialogName.trim();
    if (!/\.[^/.]+$/.test(name)) name += ".txt";
    const content = activeNote.content;
    try {
      await createFile({
        folderId: dialogFolderId as Id<"folders">,
        name,
        type: "text/plain",
        size: new Blob([content]).size.toString(),
        content,
        contentUrl: "",
      });
      toast.success("File saved");
      setShowDialog(false);
      onClose();
    } catch (err) {
      toast.error("Failed to save file");
      console.error(err);
    }
  };

  return (
    <div className="bg-white/60 backdrop-blur-2xl w-full h-full flex flex-col relative">
      <div className="flex items-center justify-between bg-white/80 backdrop-blur-sm px-4 py-2 border-b border-white/60">
        <div className="flex border-b border-gray-200">
          {notes.map((note) => (
            <div
              key={note.id}
              onClick={() => setActiveId(note.id)}
              className={`py-2 px-3 cursor-pointer text-sm transition-colors duration-150 ${note.id === activeId ? "border-b-2 border-indigo-500 text-indigo-600" : "text-black/40 hover:text-black/70"}`}
            >
              {note.name}
            </div>
          ))}
        </div>
        <div className="flex items-center space-x-2">
          <button onClick={() => { setDialogName(`note-${Date.now()}.txt`); setShowDialog(true); }} className="p-1 hover:bg-gray-200 rounded">
            <Save className="w-5 h-5 text-gray-700" />
          </button>
          <button onClick={handleNew} className="p-1 hover:bg-gray-200 rounded">
            <Plus className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      </div>

      <textarea
        value={activeNote.content}
        onChange={(e) => updateContent(e.target.value)}
        className="flex-1 p-4 resize-none focus:outline-none font-mono text-sm"
        placeholder="Start typing…"
      />

      {showDialog && (
        <div className="absolute inset-0 bg-black/25 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white/80 backdrop-blur-2xl border border-white/60 rounded-2xl shadow-xl w-96">
            <div className="bg-white/50 border-b border-white/60 p-2 rounded-t-2xl">
              <h3 className="text-sm text-center font-semibold">Save File</h3>
            </div>
            <div className="flex flex-col p-4 gap-4">
              <Input
                value={dialogName}
                onChange={(e) => setDialogName(e.target.value)}
                className="bg-white"
                placeholder="filename.txt"
              />
              <Select value={dialogFolderId} onValueChange={setDialogFolderId}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Select folder" />
                </SelectTrigger>
                <SelectContent>
                  {(folders ?? []).map((f) => (
                    <SelectItem key={f._id} value={f._id}>{f.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex space-x-2 justify-center pb-4">
              <Button onClick={() => setShowDialog(false)} className="px-3 h-8 text-xs bg-white/60 text-black/70 hover:bg-white/80 border border-white/60">Cancel</Button>
              <Button onClick={() => void handleSave()} className="px-3 h-8 text-xs bg-indigo-600 hover:bg-indigo-700 text-white">Save</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/webos/apps/text-editor.tsx
git commit -m "feat(text-editor): named tabs + open with pendingFile content from File Explorer"
```

---

## Task 6: FolderView — per-item context menus + inline rename

**Files:**
- Modify: `src/components/webos/apps/file-explorer/folder-view.tsx`

- [ ] **Step 1: Replace `folder-view.tsx` with updated version**

Key changes:
- `File_` type gains `content?: string | null`
- `onFileClick` prop changes to `(file: File_) => void`
- Each folder/file item wrapped in its own `<ContextMenu>`
- `renamingId` + `renameValue` state for inline rename
- Mutations `renameFile`, `renameFolder`, `softDeleteFile`, `softDeleteFolder` called directly
- Double-click on name triggers rename

```tsx
"use client";

import { File } from "lucide-react";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
} from "@/components/ui/context-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ImagePreview from "./image-preview";
import { Breadcrumbs } from "./breadcrumbs";
import { toast } from "sonner";

const IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];

type Folder = { _id: string; name: string };
type File_ = {
  _id: string;
  name: string;
  type?: string | null;
  contentUrl?: string | null;
  content?: string | null;
};
type Crumb = { _id: string; name: string };

type Props = {
  folderId: string;
  setFolderId: (id: string) => void;
  childFolders: Folder[];
  files: File_[];
  breadcrumbs: Crumb[];
  onCreateFolder: (name: string, parentId: string) => Promise<void>;
  onUpload: (files: FileList, folderId: string) => Promise<void>;
  onFileClick: (file: File_) => void;
};

export default function FolderView({
  folderId, setFolderId, childFolders, files, breadcrumbs, onCreateFolder, onUpload, onFileClick,
}: Props) {
  const [showDialog, setShowDialog] = useState(false);
  const [dialogName, setDialogName] = useState("newfolder");
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const renameInputRef = useRef<HTMLInputElement>(null);

  const renameFileMutation = useMutation(api.files.renameFile);
  const renameFolderMutation = useMutation(api.folders.renameFolder);
  const softDeleteFileMutation = useMutation(api.files.softDeleteFile);
  const softDeleteFolderMutation = useMutation(api.folders.softDeleteFolder);

  useEffect(() => {
    if (renamingId) renameInputRef.current?.focus();
  }, [renamingId]);

  const startRename = (id: string, currentName: string) => {
    setRenamingId(id);
    setRenameValue(currentName);
  };

  const commitRename = async (type: "file" | "folder") => {
    if (!renamingId || !renameValue.trim()) {
      setRenamingId(null);
      return;
    }
    try {
      if (type === "file") {
        await renameFileMutation({ fileId: renamingId as Id<"files">, newName: renameValue.trim() });
      } else {
        await renameFolderMutation({ folderId: renamingId as Id<"folders">, newName: renameValue.trim() });
      }
    } catch {
      toast.error("Rename failed");
    }
    setRenamingId(null);
  };

  const handleDeleteFile = async (fileId: string) => {
    await softDeleteFileMutation({ fileId: fileId as Id<"files"> });
    toast.success("Moved to Trash");
  };

  const handleDeleteFolder = async (folderId: string) => {
    await softDeleteFolderMutation({ folderId: folderId as Id<"folders"> });
    toast.success("Moved to Trash");
  };

  const handleSave = async () => {
    if (!dialogName.trim()) return;
    await onCreateFolder(dialogName.trim(), folderId);
    setShowDialog(false);
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger className="block w-full h-full overflow-auto relative">
        <Breadcrumbs breadcrumbs={breadcrumbs} folderId={folderId} setFolderId={setFolderId} onUpload={onUpload} />
        <ul className="mb-6 grid grid-cols-4 gap-4">
          {childFolders.map((f) => (
            <ContextMenu key={f._id}>
              <ContextMenuTrigger asChild>
                <li>
                  <button
                    className="flex flex-col items-center space-y-2 hover:bg-gray-100 px-2 py-3 rounded w-full text-left text-sm text-muted-foreground"
                    onClick={() => setFolderId(f._id)}
                  >
                    <Image src="/file.svg" alt="folder" width={30} height={30} />
                    {renamingId === f._id ? (
                      <Input
                        ref={renameInputRef}
                        value={renameValue}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") void commitRename("folder");
                          if (e.key === "Escape") setRenamingId(null);
                        }}
                        onBlur={() => void commitRename("folder")}
                        className="h-6 text-xs px-1 w-full"
                      />
                    ) : (
                      <span onDoubleClick={(e) => { e.stopPropagation(); startRename(f._id, f.name); }}>
                        {f.name}
                      </span>
                    )}
                  </button>
                </li>
              </ContextMenuTrigger>
              <ContextMenuContent className="w-40">
                <ContextMenuItem onClick={() => startRename(f._id, f.name)}>Rename</ContextMenuItem>
                <ContextMenuItem onClick={() => void handleDeleteFolder(f._id)} className="text-red-600">Delete</ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          ))}

          {files.map((file) => (
            <ContextMenu key={file._id}>
              <ContextMenuTrigger asChild>
                <li onClick={() => file.contentUrl && onFileClick(file)}>
                  <div className="flex flex-col items-center space-y-2 hover:bg-gray-100 px-2 py-3 rounded cursor-pointer text-center text-sm text-muted-foreground">
                    {IMAGE_TYPES.includes(file.type ?? "") ? (
                      <ImagePreview s3Key={file.contentUrl ?? ""} alt={file.name} />
                    ) : (
                      <File className="size-8 text-gray-600" />
                    )}
                    {renamingId === file._id ? (
                      <Input
                        ref={renameInputRef}
                        value={renameValue}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") void commitRename("file");
                          if (e.key === "Escape") setRenamingId(null);
                        }}
                        onBlur={() => void commitRename("file")}
                        className="h-6 text-xs px-1 w-full"
                      />
                    ) : (
                      <span
                        className="truncate"
                        onDoubleClick={(e) => { e.stopPropagation(); startRename(file._id, file.name); }}
                      >
                        {file.name.slice(0, 10)}
                      </span>
                    )}
                  </div>
                </li>
              </ContextMenuTrigger>
              <ContextMenuContent className="w-40">
                <ContextMenuItem onClick={() => onFileClick(file)}>Open</ContextMenuItem>
                <ContextMenuItem onClick={() => startRename(file._id, file.name)}>Rename</ContextMenuItem>
                <ContextMenuItem onClick={() => void handleDeleteFile(file._id)} className="text-red-600">Delete</ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          ))}
        </ul>

        {showDialog && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <div className="bg-white/65 rounded-lg shadow-lg w-80">
              <div className="bg-white/50 border-b p-2 rounded-t-xl">
                <h3 className="text-sm text-center font-semibold">New Folder</h3>
              </div>
              <div className="p-4">
                <Input value={dialogName} onChange={(e) => setDialogName(e.target.value)} className="bg-white" />
              </div>
              <div className="flex space-x-2 justify-center pb-4">
                <Button onClick={() => setShowDialog(false)} className="px-3 h-8 text-xs bg-black/60">Cancel</Button>
                <Button onClick={() => void handleSave()} className="px-3 h-8 text-xs bg-black/60">Save</Button>
              </div>
            </div>
          </div>
        )}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        <ContextMenuItem onClick={() => setShowDialog(true)}>New Folder</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors. (Note: `file-explorer.tsx` will error on `onFileClick` type mismatch until Task 7.)

- [ ] **Step 3: Commit**

```bash
git add src/components/webos/apps/file-explorer/folder-view.tsx
git commit -m "feat(file-explorer): per-item context menus, inline rename, soft-delete wired to UI"
```

---

## Task 7: FileExplorer — smart onFileClick dispatch

**Files:**
- Modify: `src/components/webos/apps/file-explorer/file-explorer.tsx`

- [ ] **Step 1: Add Text Editor import and update handleFileClick**

Make these targeted changes to `file-explorer.tsx`:

**1. Add import** (after the existing `useImagePreview` import):
```tsx
import { useTextEditor } from "@/hooks/webos/use-text-editor";
```

**2. Add store hook** (after the `openImagePreview` line):
```tsx
const { onOpen: openTextEditor } = useTextEditor();
```

**3. Add the File_ type** (after the imports, before the component):
```tsx
type File_ = {
  _id: string;
  name: string;
  type?: string | null;
  contentUrl?: string | null;
  content?: string | null;
};

const TEXT_TYPES = [
  "text/plain",
  "text/markdown",
  "application/json",
  "text/html",
  "text/css",
  "text/javascript",
  "application/javascript",
];
const IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];
```

**4. Replace the `onFileClick={openImagePreview}` prop** with a handler. Add this function inside the component (after `handleCreateFolder`):
```tsx
const handleFileClick = (file: File_) => {
  if (IMAGE_TYPES.includes(file.type ?? "")) {
    openImagePreview(file.contentUrl ?? "");
  } else if (TEXT_TYPES.includes(file.type ?? "")) {
    openTextEditor({ name: file.name, content: file.content ?? "" });
  }
};
```

**5. Update the `FolderView` prop** — change:
```tsx
onFileClick={openImagePreview}
```
to:
```tsx
onFileClick={handleFileClick}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Manual verification in browser**

Start dev server: `npm run dev`

Check each scenario:
1. **Right-click a file** → context menu shows Open / Rename / Delete
2. **Right-click a folder** → context menu shows Rename / Delete
3. **Right-click empty space** → context menu shows New Folder only
4. **Rename file**: right-click → Rename → type new name → Enter → name updates
5. **Rename folder**: double-click name → type → Enter → name updates
6. **Delete file**: right-click → Delete → toast "Moved to Trash" → file disappears
7. **Delete folder**: right-click → Delete → folder and its contents disappear
8. **Open image file**: click → Image Preview opens
9. **Open text file**: click → Text Editor opens with file content in a named tab

- [ ] **Step 4: Commit**

```bash
git add src/components/webos/apps/file-explorer/file-explorer.tsx
git commit -m "feat(file-explorer): route file clicks to Image Preview or Text Editor by MIME type"
```

---

## Done

All four features implemented:
- **F-29 Rename**: inline double-click + context menu on files and folders
- **F-30 Delete → Trash**: soft-delete via `deletedAt`; cascade for folders; Sonner toast confirmation
- **F-34 Context menu**: per-item menus with Open / Rename / Delete
- **F-38 Open in app**: images → Image Preview, text files → Text Editor with named tab + content
