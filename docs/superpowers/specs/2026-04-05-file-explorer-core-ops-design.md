# File Explorer — Core Operations Design

**Date:** 2026-04-05  
**Features:** F-29 (Rename), F-30 (Delete → Trash), F-34 (Context menu), F-38 (Open in app)  
**Approach:** Option A — Minimal, focused changes in existing files only

---

## Overview

Add the four most critical missing file operations to the File Explorer: rename, soft-delete (to Trash), right-click context menus on files and folders, and opening files in the appropriate app (Image Preview or Text Editor). No new component files are created — all changes are in existing Convex mutations and the two existing UI components.

---

## 1. Data Layer

### Schema changes — `convex/schema.ts`

Add `deletedAt` (optional timestamp) to both tables:

```ts
files: defineTable({
  // ...existing fields...
  deletedAt: v.optional(v.number()),
})

folders: defineTable({
  // ...existing fields...
  deletedAt: v.optional(v.number()),
})
```

Soft-deleted items have `deletedAt` set to `Date.now()`. Items without the field (or with `undefined`) are active.

### Query filter updates

All existing read queries must exclude soft-deleted items:

- `convex/files.ts`: `getFilesByFolder`, `searchFiles`, `getFileById`
- `convex/folders.ts`: `getRootFolders`, `getFolders`, `getFoldersByParent`, `getFolderBreadcrumb`, `searchFoldersByName`

Each gains a `.filter(q => q.eq(q.field("deletedAt"), undefined))` condition.

### New mutations — `convex/files.ts`

```ts
renameFile(fileId: Id<"files">, newName: string): void
  // Patch: { name: newName }

softDeleteFile(fileId: Id<"files">): void
  // Patch: { deletedAt: Date.now() }
```

### New mutations — `convex/folders.ts`

```ts
renameFolder(folderId: Id<"folders">, newName: string): void
  // Patch: { name: newName }

softDeleteFolder(folderId: Id<"folders">): void
  // Cascades: set deletedAt on the folder itself, all descendant folders,
  // and all files within any of those folders.
  // Uses getFoldersByParent recursively to collect all descendant folder IDs,
  // then patches all in one pass.
```

Cascade strategy for `softDeleteFolder`: BFS/DFS collect all descendant folder IDs, then patch each folder and all files within each folder with `deletedAt: Date.now()`.

---

## 2. UI Layer

### Context menu on files — `folder-view.tsx`

Each file grid item is wrapped in Radix `<ContextMenu>`. Menu items:

| Item | Action |
|------|--------|
| **Open** | Image types → open Image Preview; text types → open Text Editor |
| **Rename** | Set `renamingId` state to this file's `_id` |
| **Delete** | Call `softDeleteFile`, show Sonner toast "Moved to Trash" |

### Context menu on folders — `folder-view.tsx`

Each folder grid item similarly wrapped. Menu items:

| Item | Action |
|------|--------|
| **Rename** | Set `renamingId` state to this folder's `_id` |
| **Delete** | Call `softDeleteFolder`, show Sonner toast "Moved to Trash" |

The existing background right-click menu (empty space) keeps only "New Folder".

### Inline rename — `folder-view.tsx`

Two state fields added to `FolderView`:

```ts
const [renamingId, setRenamingId] = useState<string | null>(null);
const [renameValue, setRenameValue] = useState("");
```

When `renamingId` matches an item's `_id`, that item renders an `<input>` instead of its name text. The input is auto-focused and pre-filled with the current name.

Commit rename on:
- `Enter` key → call `renameFile` or `renameFolder` mutation, clear `renamingId`
- `Blur` → same as Enter
- `Escape` → clear `renamingId` without saving

Double-clicking a file or folder name also triggers rename (sets `renamingId`).

### Open file in app — `file-explorer.tsx`

The `onFileClick` handler (currently opens Image Preview for all files) is updated:

- **Image types** (`image/png`, `image/jpeg`, `image/gif`, `image/webp`, etc.) → open Image Preview (existing behavior)
- **Text types** (`text/plain`, `text/markdown`, `application/json`, etc.) → open Text Editor via `useTextEditor().onOpen()`, passing the file's content URL or text content
- **Other types** → no-op for now

---

## 3. Error Handling

- Rename with empty string → no-op (don't call mutation)
- Delete on a folder with children → cascade handles it silently
- All mutations use Convex's optimistic updates via `useMutation` — UI updates immediately

---

## 4. Out of Scope

The following are explicitly excluded from this implementation:

- Restore from Trash / Empty Trash (F-31) — Trash Bin app wired separately
- Drag-and-drop between folders (F-32)
- Sort & view modes (F-33)
- Cut / Copy / Paste (F-34 partial)
- File details panel (F-35)
- Confirmation dialogs for delete
- Keyboard shortcuts (Delete key, F2 for rename)
