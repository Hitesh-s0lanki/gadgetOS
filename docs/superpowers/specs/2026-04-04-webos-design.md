# WebOS Implementation Design

**Date:** 2026-04-04  
**Branch:** features/webos-integration  
**Reference:** https://github.com/Hitesh-s0lanki/gadgetOS-scrape/tree/web_os_develope

---

## Overview

Implement a browser-based desktop OS experience at `/webos` in the existing GadgetOS Next.js project. The WebOS is a full-screen interactive environment with a lock screen, a macOS-style desktop (top navbar + bottom floating dock), and nine draggable application windows. Backend is Convex (real-time DB, file storage metadata, vector search) + AWS S3 (file storage) + OpenAI (AI terminal, embeddings).

Implementation is phased: **UI → Convex → Logic**.

---

## Route Structure

| Route | Purpose |
|---|---|
| `/webos/lock-screen` | Lock screen — live clock, click anywhere to enter desktop |
| `/webos` | Desktop environment |
| `/demo` | Redirects to `/webos/lock-screen` |

The `/webos/layout.tsx` wraps children in `ConvexClientProvider` and a full-screen container. The `(public)` landing page is completely untouched.

---

## File Structure

```
src/
├── app/
│   ├── (public)/                      # existing — untouched
│   ├── demo/page.tsx                  # redirect → /webos/lock-screen
│   └── webos/
│       ├── layout.tsx                 # ConvexClientProvider + full-screen wrapper
│       ├── page.tsx                   # Desktop
│       └── lock-screen/page.tsx       # Lock screen
│
├── components/webos/
│   ├── desktop/
│   │   ├── desktop-screen.tsx         # Root: Navbar + WindowProvider + Taskbar
│   │   ├── navbar.tsx                 # Top menu bar
│   │   ├── taskbar.tsx                # Bottom floating dock
│   │   └── date-time.tsx              # Live clock in taskbar
│   ├── window/
│   │   └── window-base.tsx            # Shared draggable window frame
│   ├── apps/
│   │   ├── terminal.tsx
│   │   ├── browser.tsx
│   │   ├── file-explorer/
│   │   │   ├── file-explorer.tsx
│   │   │   ├── folder-view.tsx
│   │   │   ├── image-preview.tsx
│   │   │   ├── breadcrumbs.tsx
│   │   │   └── search-window.tsx
│   │   ├── settings.tsx
│   │   ├── text-editor.tsx
│   │   ├── clock.tsx
│   │   ├── about.tsx
│   │   └── trash-bin.tsx
│   ├── providers/
│   │   └── window-provider.tsx        # Mounts all WindowBase instances
│   ├── lock-screen.tsx
│   └── context-menu.tsx
│
├── hooks/webos/
│   ├── create-window-store.ts         # Factory: createWindowStore(title)
│   ├── use-terminal.ts
│   ├── use-browser.ts
│   ├── use-file-explorer.ts
│   ├── use-settings.ts
│   ├── use-text-editor.ts
│   ├── use-clock.ts
│   ├── use-about.ts
│   ├── use-trash-bin.ts
│   └── use-image-preview.ts
│
└── app/api/
    ├── openai-terminal/route.ts       # AI terminal fallback (POST)
    ├── presign/route.ts               # S3 presigned URL (GET)
    └── upload/route.ts                # S3 file upload (POST)

convex/
├── schema.ts
├── users.ts
├── folders.ts
├── files.ts
├── search.ts
└── openai.ts
```

---

## Architecture

### Desktop Layout

```
/webos/layout.tsx
  └── ConvexClientProvider
        └── DesktopScreen
              ├── Navbar            (top, h-8, glass blur)
              ├── WindowProvider    (client-only, renders all 9 windows)
              └── Taskbar           (bottom, floating dock + clock)
```

### Window System

**`createWindowStore(title)`** — Zustand factory, every app gets the same shape:

```ts
{
  title: string
  isOpen: boolean
  isMinimized: boolean
  zIndex: number
  onOpen(): void
  onClose(): void
  onMinimize(): void
}
```

Each hook file is a single line: `export const useTerminal = createWindowStore("Terminal")`

**`WindowBase`** — single shared draggable frame component:
- Uses `@dnd-kit/core` for drag-and-drop positioning
- Title bar with macOS-style close (red) / minimize (yellow) / fullscreen (green) buttons
- Title bar is the drag handle
- Fullscreen toggles between fixed position and `translate(x,y)` positioning
- Minimized state hides via `hidden` class
- Position clamped to viewport bounds on drag end
- Renders children (the app content) below the title bar
- Mounted via `createPortal(…, document.body)`

**`WindowProvider`** — mounts all 9 `<WindowBase>` instances, guarded by `isMounted` to prevent SSR hydration mismatch.

### Taskbar

`FloatingDock` (existing UI component) with 9 app icon entries. Each icon's `onClick` calls the corresponding store's `onOpen()`. A `DateTimeDisplay` component sits beside the dock showing live time.

### Navbar

Top frosted bar with:
- Left: GadgetOS menu popover → shutdown / restart / sleep icons
- Right: WiFi / Sound / Battery popover → 6 quick-toggle icons + brightness slider

---

## Convex Schema

```ts
users:   { username, password }           index: by_username
folders: { userId, name, parentId? }      indexes: by_user, by_name; searchIndex: search_files
files:   { userId, folderId, name, type?, size?, content?,
           contentUrl?, description?, vector? }
         indexes: by_folder, by_user, by_name
         searchIndex: search_files
         vectorIndex: by_vector (1536-dim, filterFields: userId, folderId)
```

### Convex Functions

| File | Exports |
|---|---|
| `users.ts` | `createUser`, `getUserByUsername` |
| `folders.ts` | `getRootFolders`, `getFoldersByParent`, `getFolderBreadcrumb`, `searchFoldersByName`, `createFolder` |
| `files.ts` | `getFilesByFolder`, `createFile`, `deleteFile`, `getFileById` |
| `search.ts` | `searchFiles` (text), `semanticSearch` (vector) |
| `openai.ts` | `generateEmbedding` (Convex action → OpenAI ada-002) |

---

## API Routes

### `POST /api/openai-terminal`
- Body: `{ command: string }`
- Calls OpenAI GPT-4.1 with system prompt for install steps vs general Q&A
- Returns `{ steps: Step[] }` or `{ answer: string }`
- 30s timeout; returns `{ error: "timeout" }` with 504 on timeout
- 429 from OpenAI bubbles up as 429 to client

### `GET /api/presign?key=<s3-key>`
- Returns `{ url: string }` — 1-hour signed S3 GET URL
- 400 if `key` missing, 500 on S3 error

### `POST /api/upload`
- Streams file directly to S3 (no memory buffering)
- Validates Content-Type; rejects unsupported types with 415
- Returns `{ key: string, url: string }`
- 413 if file exceeds size limit

---

## Error Handling

| Layer | Strategy |
|---|---|
| Window DnD | Clamp position to viewport on `dragEnd` |
| SSR hydration | `isMounted` guard in `WindowProvider` and `Navbar` |
| Convex queries | `undefined` while loading → skeleton UI; errors → `sonner` toast |
| File upload | Validate type + size client-side before S3; show inline error on failure |
| API routes | Structured `{ error: string }` JSON + correct HTTP status codes |
| Missing env vars | Explicit `throw new Error("Missing OPENAI_API_KEY")` at module init |
| OpenAI timeout | 30s AbortController; terminal shows "Request timed out, try again" |

---

## Dependencies to Add

```
zustand
@dnd-kit/core
@dnd-kit/utilities
@aws-sdk/client-s3
@aws-sdk/s3-request-presigner
```

---

## Implementation Phases

### Phase 1 — UI (static, no backend calls)
1. Install dependencies
2. `createWindowStore` factory + all 9 hook files
3. `WindowBase` draggable frame component
4. `WindowProvider`
5. Lock screen component + route
6. Desktop screen (Navbar + Taskbar + WindowProvider)
7. `/webos/layout.tsx` + `/webos/page.tsx`
8. Update `/demo` redirect
9. All 9 app inner components (static/placeholder content)
10. Copy required SVG assets to `/public`

### Phase 2 — Convex
1. `convex/schema.ts`
2. `convex/users.ts`, `folders.ts`, `files.ts`, `search.ts`, `openai.ts`
3. Wire Convex queries into File Explorer and Terminal

### Phase 3 — Logic & APIs
1. `POST /api/openai-terminal` route
2. `GET /api/presign` + `POST /api/upload` routes
3. AI Terminal (command dispatch + OpenAI fallback)
4. File Explorer (browse, upload, preview, semantic search)
5. Settings (brightness slider, system toggles — UI only, no actual OS calls)
6. Text Editor (read/write file content via Convex)
