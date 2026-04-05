# GadgetOS — Feature Backlog

Pick features one by one from this list. Each item is self-contained and can be implemented independently.

Legend: ✅ Done · 🔲 Not started · 🚧 Partial

---

## Infrastructure & Auth

- [🔲] **F-01 · User Auth — Login / Register flow**
  Sign-up and login pages backed by the `users` Convex table. Password hashing (bcrypt). Session stored in a cookie or Convex session. Lock screen should authenticate against real users instead of any click.

- [🔲] **F-02 · Lock Screen — real auth gate**
  Currently navigates to desktop on any click. Wire it to the session: prompt for PIN/password, validate against Convex, only navigate on success.

- [🔲] **F-03 · Multi-user support**
  All Convex queries/mutations already scope by `userId` — expose this in the UI (user switcher, profile icon in navbar).

---

## Desktop Shell

- [✅] **F-04 · Desktop layout** — navbar + taskbar/dock + wallpaper
- [✅] **F-05 · Draggable windows** — `WindowBase` with dnd-kit
- [✅] **F-06 · Floating dock** — animated bottom dock with app launchers
- [🔲] **F-07 · Window z-index / focus management**
  Clicking a window should bring it to the front. Currently all windows share the same z-index and overlap incorrectly.

- [🔲] **F-08 · Window minimize to dock**
  Minimize button should hide the window and show an indicator dot on the dock icon. Clicking the dock icon un-minimizes.

- [🔲] **F-09 · Window maximize / full-screen toggle**
  The yellow maximize button is present but does nothing. Wire it to expand the window to fill the desktop area.

- [🔲] **F-10 · Window resize (drag edges/corners)**
  Windows are fixed-size after open. Add resize handles on all four edges and corners.

- [🔲] **F-11 · Desktop wallpaper picker**
  Allow users to select from a set of built-in wallpapers (or upload one) and persist the choice (localStorage or Convex user prefs).

- [🔲] **F-12 · Desktop icons / shortcuts**
  Allow files and folders to appear on the desktop surface itself (drag from File Explorer, double-click to open).

- [🔲] **F-13 · Right-click context menu — full actions**
  Current context menu is a stub. Implement all items: New Folder, New File, Change Wallpaper, Refresh, Show/Hide Desktop Icons.

---

## Navbar (Menu Bar)

- [✅] **F-14 · Navbar shell** — GadgetOS menu + system tray
- [🔲] **F-15 · App-specific menus in navbar**
  When a window is focused, the navbar should show that app's menus (File, Edit, View, …) — macOS-style global menu bar.

- [🔲] **F-16 · Notification center**
  Bell icon in navbar that shows a drawer of system/app notifications (e.g. file upload complete, terminal output).

- [🔲] **F-17 · Wi-Fi / Network status (simulated)**
  Popover showing a fake network list; toggling toggles the "connected" indicator.

- [🔲] **F-18 · Volume control**
  Slider popover that controls system-level media volume via the Web Audio API.

- [🔲] **F-19 · Battery indicator (simulated or real)**
  Use the `navigator.getBattery()` API on supported browsers; fall back to a static icon.

- [🔲] **F-20 · Spotlight / global search**
  Cmd+Space opens a full-screen search overlay that queries files, folders, and app names via Convex search.

---

## UI Polish (Design Overhaul)

- [🔲] **F-21 · Glass design system — full overhaul**
  Apply the macOS-inspired frosted glass theme across ALL components per `docs/superpowers/specs/2026-04-05-webos-ui-overhaul-design.md`. Tokens in `globals.css`, then component-by-component: Window, Navbar, Taskbar, Lock Screen, Terminal, File Explorer, Settings, About, Clock, Text Editor, Trash Bin, Context Menu.

- [🔲] **F-22 · Window open/close animations**
  200ms `fade-in + zoom-in-95` on open; scale-down + fade on close.

- [🔲] **F-23 · Dock hover magnification**
  FloatingDock already has basic hover; tune the spring animation and icon scale to match macOS dock feel.

---

## File Explorer

- [✅] **F-24 · Folder tree + file list** — Convex-backed
- [✅] **F-25 · Image preview window**
- [✅] **F-26 · Text search + vector (semantic) search**
- [✅] **F-27 · Create file / folder from UI**
- [🔲] **F-28 · Upload file to S3 from File Explorer**
  "Upload" button in the toolbar that opens a file picker, uploads to S3 via `/api/upload`, then writes the Convex file record. Show a progress toast.

- [🔲] **F-29 · Rename file / folder**
  Inline double-click rename with an input; call Convex mutation to update the name.

- [🔲] **F-30 · Delete file / folder → Trash**
  "Delete" action moves item to a `trash` collection (soft delete with `deletedAt` field); the Trash Bin app shows these items.

- [🔲] **F-31 · Restore / permanently delete from Trash**
  Trash Bin: "Restore" moves item back; "Empty Trash" permanently deletes from Convex + S3.

- [🔲] **F-32 · Drag-and-drop files between folders**
  Drag a file/folder row onto a sidebar folder to move it (update `folderId` / `parentId` in Convex).

- [🔲] **F-33 · File/folder sort & view modes**
  Toolbar toggles: list view vs grid/icon view; sort by name / date / size.

- [🔲] **F-34 · Copy / move via context menu**
  Right-click on a file → Copy, Cut, Paste into another folder.

- [🔲] **F-35 · File details panel**
  Side panel showing metadata: name, size, type, created date, S3 URL, AI description.

- [🔲] **F-36 · AI image description on upload**
  After uploading an image, call OpenAI vision to generate a description and store it in `files.description`. Display in F-35.

---

## Text Editor

- [✅] **F-37 · Multi-tab text editor** — Convex `createTextFile` on save
- [🔲] **F-38 · Open file from File Explorer in Text Editor**
  Double-clicking a text file in File Explorer opens it in the Text Editor (pass content, set tab title to filename).

- [🔲] **F-39 · Save existing file back to Convex**
  Currently only creates new files. Add a "Save" flow that updates the existing Convex record if the file was opened from File Explorer.

- [🔲] **F-40 · Syntax highlighting**
  Use a lightweight library (e.g. `highlight.js` or `prism-react-renderer`) to highlight code based on file extension.

- [🔲] **F-41 · Find & Replace**
  Cmd+F opens a find bar within the editor; Cmd+H adds a replace field.

- [🔲] **F-42 · Word count / line count status bar**
  Bottom bar showing line:col, word count, character count.

---

## Terminal

- [✅] **F-43 · Terminal shell** — ls, cd, mkdir, touch, cat via Convex
- [✅] **F-44 · AI fallback** — unknown commands answered by GPT-4.1
- [🔲] **F-45 · Command history (↑/↓ arrows)**
  Store executed commands in a local array; up/down arrow cycles through history.

- [🔲] **F-46 · Tab completion**
  Tab key auto-completes folder/file names based on current directory content.

- [🔲] **F-47 · `open` command**
  `open <filename>` opens the file in the appropriate app (image → Image Preview, text → Text Editor).

- [🔲] **F-48 · `rm` / `rmdir` command**
  Deletes file or folder (moves to trash, see F-30).

- [🔲] **F-49 · `cp` / `mv` commands**
  Copy or move files/folders between directories.

- [🔲] **F-50 · Multiple terminal sessions / tabs**
  Tab bar at the top of the terminal window to open multiple independent shells.

---

## Browser App

- [✅] **F-51 · Browser shell** — iframe-based web browser
- [✅] **F-52 · Browser navigation** — back/forward/reload wired to a React URL stack.
- [✅] **F-53 · Bookmarks bar** — star button adds/removes bookmark; persisted in Convex; shown as pill bar below toolbar.
- [✅] **F-54 · Browser history** — every navigation recorded in Convex; history popover with clear-all action.

---

## Clock App

- [✅] **F-55 · Analog + digital clock display**
- [🔲] **F-56 · World clocks**
  Add/remove timezones and display them as additional clocks.

- [🔲] **F-57 · Stopwatch**
  Tab with start/stop/reset stopwatch.

- [🔲] **F-58 · Timer / alarm**
  Set a countdown; show a toast notification when it fires.

---

## Settings App

- [✅] **F-59 · Settings shell** — sidebar navigation (stubs)
- [🔲] **F-60 · Appearance settings (functional)**
  - Select wallpaper (integrates with F-11)
  - Toggle light/dark mode for the OS
  - Accent color picker

- [🔲] **F-61 · User profile settings**
  Change display name, avatar. Persisted in Convex `users` table.

- [🔲] **F-62 · Keyboard shortcut viewer**
  Read-only list of all global shortcuts (open Terminal, File Explorer, etc.).

- [🔲] **F-63 · Notifications settings**
  Toggle per-app notification permission.

---

## About App

- [✅] **F-64 · About GadgetOS info panel**
- [🔲] **F-65 · Real system info**
  Show browser user-agent, screen resolution, memory (if available via `performance.memory`), and uptime (time since page load).

---

## Trash Bin

- [✅] **F-66 · Trash Bin shell** (empty state only)
- [🔲] **F-67 · Trash Bin — real deleted items** (depends on F-30, F-31)

---

## Global Shortcuts & OS Behaviors

- [🔲] **F-68 · Global keyboard shortcuts**
  - `Cmd+Space` → Spotlight (F-20)
  - `Cmd+Tab` → App switcher overlay
  - `Cmd+Q` → Close focused window
  - `Cmd+M` → Minimize focused window
  - `Cmd+W` → Close focused window tab (Text Editor)

- [🔲] **F-69 · App switcher (Cmd+Tab)**
  Overlay showing open windows with icons; arrow keys cycle, release to focus.

- [🔲] **F-70 · System notifications / toasts**
  Unified toast system (Sonner is installed) triggered by OS events: file saved, upload complete, timer fired.

- [🔲] **F-71 · Screen saver / idle lock**
  After N minutes of inactivity, navigate back to the lock screen.

---

## Public Landing Page

- [🔲] **F-72 · Waiting list backend**
  Connect the waiting list form on the public page to a Convex table (or email service) instead of being a static UI.

- [🔲] **F-73 · Live WebOS demo embed**
  The `web-demo.tsx` component on the landing page should show a real live preview of the desktop (iframe or screenshot rotation).

---

## Notes

- Features are roughly ordered by dependency: auth (F-01–F-03) unlocks per-user data; the glass overhaul (F-21) is pure CSS and can be done any time; core file operations (F-28–F-36) unlock the full File Explorer → Text Editor → Terminal loop.
- Features marked ✅ are **functional but may need polish** (especially UI style — covered by F-21).
- Start with whichever feature the user picks; each is self-contained enough to implement in a single session.
