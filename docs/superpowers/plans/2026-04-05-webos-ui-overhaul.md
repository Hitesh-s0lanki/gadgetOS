# WebOS UI Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply a macOS-inspired frosted-glass aesthetic with an indigo accent color across all 13 WebOS UI components, with no logic changes and no new dependencies.

**Architecture:** Pure className/style changes only — no new files, no new packages. Every glass surface uses Tailwind's `bg-white/{opacity} backdrop-blur-{size}` utilities. The indigo accent (`#6366f1` / `indigo-500`) replaces all previous blue/purple/gray selected/active states. `tw-animate-css` (already installed) provides `animate-in fade-in-0 zoom-in-95` for window entrances.

**Tech Stack:** Next.js 15, Tailwind CSS v4, `tw-animate-css`, shadcn/ui components

---

## File Change Map

| File | What changes |
|---|---|
| `src/components/webos/window/window-base.tsx` | Glass body + title bar + entrance animation |
| `src/components/webos/desktop/navbar.tsx` | Stronger blur, border-b, popover glass |
| `src/components/webos/desktop/date-time.tsx` | Glass pill sizing + font |
| `src/components/webos/lock-screen.tsx` | Translucent overlay + typography |
| `src/components/webos/apps/terminal.tsx` | Full dark theme, indigo prompt, green output |
| `src/components/webos/apps/file-explorer/file-explorer.tsx` | Glass sidebar + indigo selected state |
| `src/components/webos/apps/settings.tsx` | Glass sidebar + indigo selected state |
| `src/components/webos/apps/about.tsx` | Replace purple bg with glass |
| `src/components/webos/apps/clock.tsx` | Indigo gradient + thinner typography |
| `src/components/webos/apps/text-editor.tsx` | Glass toolbar + indigo buttons |
| `src/components/webos/apps/trash-bin.tsx` | Better empty state |
| `src/components/webos/context-menu.tsx` | Glass context menu |

---

## Task 1: Window Chrome

**Files:**
- Modify: `src/components/webos/window/window-base.tsx`

This is the most impactful change — every app window uses this component.

- [ ] **Step 1: Apply glass + entrance animation to the window container**

In `window-base.tsx`, find the `ModalWindow` function's return. Replace the outer `div`'s className:

```tsx
// BEFORE (line ~83-87):
className={cn(
  "fixed top-0 left-0 z-50 bg-white rounded-xl shadow-xl flex flex-col",
  !isFullscreen ? `${width} ${height}` : "inset-x-0 top-8 bottom-24 w-full rounded-none",
  isMinimized && "hidden"
)}

// AFTER:
className={cn(
  "fixed top-0 left-0 z-50 bg-white/60 backdrop-blur-2xl rounded-xl border border-white/65 shadow-[0_8px_40px_rgba(0,0,0,0.18)] ring-1 ring-white/30 flex flex-col animate-in fade-in-0 zoom-in-95 duration-200",
  !isFullscreen ? `${width} ${height}` : "inset-x-0 top-8 bottom-24 w-full rounded-none",
  isMinimized && "hidden"
)}
```

- [ ] **Step 2: Polish the title bar**

Replace the title bar `div` className:

```tsx
// BEFORE (line ~90):
<div className="grid grid-cols-3 items-center bg-gray-100 border-b p-2 rounded-t-xl">

// AFTER:
<div className="grid grid-cols-3 items-center bg-white/55 backdrop-blur-2xl border-b border-white/60 p-2 rounded-t-xl">
```

- [ ] **Step 3: Verify visually**

Start the dev server if not running: `npm run dev`

Open the WebOS at `http://localhost:3000/webos`. Open any app (e.g. Settings). Confirm:
- Window has frosted glass body (not solid white)
- Title bar is slightly translucent
- Window entrance has a subtle fade+scale animation

- [ ] **Step 4: Commit**

```bash
git add src/components/webos/window/window-base.tsx
git commit -m "feat(webos): glass window chrome + entrance animation"
```

---

## Task 2: Navbar

**Files:**
- Modify: `src/components/webos/desktop/navbar.tsx`

- [ ] **Step 1: Strengthen the navbar glass**

Replace the outer bar `div`:

```tsx
// BEFORE (line ~19):
<div className="h-8 bg-white/30 w-full px-2 py-1 flex justify-between items-center">

// AFTER:
<div className="h-8 bg-white/35 backdrop-blur-2xl border-b border-white/50 w-full px-2 py-1 flex justify-between items-center">
```

- [ ] **Step 2: Polish the GadgetOS button**

```tsx
// BEFORE (line ~23):
<Button variant="ghost" className="h-6 hover:bg-white/20 rounded-sm text-sm">

// AFTER:
<Button variant="ghost" className="h-6 hover:bg-white/30 rounded-md text-sm font-semibold text-black/70 transition-colors duration-150">
```

- [ ] **Step 3: Polish the GadgetOS menu popover**

```tsx
// BEFORE (line ~27):
<PopoverContent className="bg-white/50 border-0 ml-3 p-4 w-full" sideOffset={15} side="bottom">

// AFTER:
<PopoverContent className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-2xl shadow-xl ml-3 p-4 w-full" sideOffset={15} side="bottom">
```

- [ ] **Step 4: Polish the system tray popover**

```tsx
// BEFORE (line ~45):
<PopoverContent className="border-0 w-full mr-4 bg-transparent shadow-none" sideOffset={15} side="bottom">

// AFTER:
<PopoverContent className="border border-white/60 w-full mr-4 bg-white/70 backdrop-blur-2xl shadow-xl rounded-2xl" sideOffset={15} side="bottom">
```

- [ ] **Step 5: Polish control grid buttons inside system tray**

```tsx
// BEFORE (line ~57):
<div className="flex items-center justify-center p-2 rounded-full bg-white cursor-pointer hover:bg-white/50">

// AFTER:
<div className="flex items-center justify-center p-2 rounded-full bg-white/60 cursor-pointer hover:bg-white/90 transition-colors duration-150">
```

- [ ] **Step 6: Verify visually**

Confirm navbar has stronger blur and visible bottom border. Click the GadgetOS menu and system tray — both popovers should look glassy with rounded corners.

- [ ] **Step 7: Commit**

```bash
git add src/components/webos/desktop/navbar.tsx
git commit -m "feat(webos): glass navbar + polished system tray popovers"
```

---

## Task 3: Date-Time Pill + Lock Screen

**Files:**
- Modify: `src/components/webos/desktop/date-time.tsx`
- Modify: `src/components/webos/lock-screen.tsx`

- [ ] **Step 1: Fix the date-time pill**

The current pill is too tall (`h-16`) and lacks blur. Replace its container div:

```tsx
// BEFORE (line ~24):
<div className="bg-white/40 h-16 rounded-2xl px-4 flex items-center space-x-3 text-black">
  <span className="text-lg font-semibold">{formattedTime}</span>
  <span className="text-lg">{formattedDate}</span>
</div>

// AFTER:
<div className="bg-white/35 backdrop-blur-[16px] border border-white/60 rounded-xl px-4 py-2 shadow-[0_4px_24px_rgba(0,0,0,0.12)] flex items-center space-x-3">
  <span className="text-sm font-semibold text-black/75">{formattedTime}</span>
  <span className="text-sm text-black/50">{formattedDate}</span>
</div>
```

- [ ] **Step 2: Polish the lock screen overlay**

In `lock-screen.tsx`, replace the `Link` className:

```tsx
// BEFORE (line ~28):
className="bg-black/70 h-screen w-full flex flex-col items-center justify-center text-white gap-2"

// AFTER:
className="bg-black/40 backdrop-blur-2xl h-screen w-full flex flex-col items-center justify-center text-white gap-2"
```

- [ ] **Step 3: Refine lock screen typography**

```tsx
// BEFORE (lines ~30-32):
<h1 className="text-7xl font-semibold">{formattedTime.split(" ")[0]}</h1>
<h2 className="text-xl">{formattedDate}</h2>
<p className="text-sm opacity-60 mt-4">Click anywhere to unlock</p>

// AFTER:
<h1 className="text-8xl font-thin tracking-tight">{formattedTime.split(" ")[0]}</h1>
<h2 className="text-lg font-medium opacity-80">{formattedDate}</h2>
<p className="text-xs opacity-50 mt-6 tracking-widest uppercase animate-pulse">Click anywhere to unlock</p>
```

- [ ] **Step 4: Verify visually**

Navigate to `http://localhost:3000` (lock screen). Confirm:
- Wallpaper is visible through the translucent dark overlay
- Time is large and thin-weight
- "Click anywhere" pulses subtly
- Dock datetime pill is compact and glassy

- [ ] **Step 5: Commit**

```bash
git add src/components/webos/desktop/date-time.tsx src/components/webos/lock-screen.tsx
git commit -m "feat(webos): glass datetime pill + refined lock screen"
```

---

## Task 4: Terminal Dark Theme

**Files:**
- Modify: `src/components/webos/apps/terminal.tsx`

The terminal currently has a white background — this task makes it look like a real terminal.

- [ ] **Step 1: Apply dark theme to the container**

Replace the container div (line ~103):

```tsx
// BEFORE:
<div ref={containerRef} className="bg-white text-gray-900 font-mono text-sm p-4 rounded-b-xl h-full overflow-auto">

// AFTER:
<div
  ref={containerRef}
  className="bg-[#0d1117] text-[#e6edf3] font-mono text-sm p-4 rounded-b-xl h-full overflow-auto"
  style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.2) transparent" }}
>
```

- [ ] **Step 2: Color the history entries**

Replace the history map render:

```tsx
// BEFORE (lines ~104-110):
{history.map((entry, i) => (
  <div key={i} className="mb-2">
    <div><span className="text-blue-600">{prompt}</span> {entry.command}</div>
    {entry.output.map((line, j) => (
      <div key={j} className="pl-4 text-gray-700 whitespace-pre-wrap">{line}</div>
    ))}
  </div>
))}

// AFTER:
{history.map((entry, i) => (
  <div key={i} className="mb-2">
    <div><span className="text-indigo-400">{prompt}</span> <span className="text-[#e6edf3]">{entry.command}</span></div>
    {entry.output.map((line, j) => (
      <div key={j} className="pl-4 text-[#3fb950] whitespace-pre-wrap">{line}</div>
    ))}
  </div>
))}
```

- [ ] **Step 3: Color the live input row**

Replace the input row (lines ~111-120):

```tsx
// BEFORE:
<div className="flex">
  <span className="text-blue-600">{prompt}</span>
  <input
    ref={inputRef}
    value={input}
    onChange={(e) => setInput(e.target.value)}
    onKeyDown={handleKeyDown}
    className="bg-transparent flex-1 ml-1 focus:outline-none"
  />
</div>

// AFTER:
<div className="flex">
  <span className="text-indigo-400">{prompt}</span>
  <input
    ref={inputRef}
    value={input}
    onChange={(e) => setInput(e.target.value)}
    onKeyDown={handleKeyDown}
    className="bg-transparent flex-1 ml-1 focus:outline-none text-[#e6edf3] caret-indigo-400"
  />
</div>
```

- [ ] **Step 4: Verify visually**

Open the Terminal app. Confirm:
- Background is near-black (`#0d1117`)
- Prompt is indigo
- Output lines are green
- Cursor blinks in indigo

- [ ] **Step 5: Commit**

```bash
git add src/components/webos/apps/terminal.tsx
git commit -m "feat(webos): dark terminal theme with indigo prompt + green output"
```

---

## Task 5: File Explorer

**Files:**
- Modify: `src/components/webos/apps/file-explorer/file-explorer.tsx`

- [ ] **Step 1: Glass root container + sidebar**

```tsx
// BEFORE (line ~111):
<div className="bg-white bg-opacity-70 backdrop-blur-md w-full h-full flex flex-col overflow-hidden">
  <div className="flex flex-1 overflow-hidden">
    <div className="w-56 bg-white bg-opacity-50 border-r border-gray-200 flex flex-col pb-2">

// AFTER:
<div className="bg-white/60 backdrop-blur-2xl w-full h-full flex flex-col overflow-hidden">
  <div className="flex flex-1 overflow-hidden">
    <div className="w-56 bg-white/50 backdrop-blur-xl border-r border-white/50 flex flex-col pb-2">
```

- [ ] **Step 2: Indigo selected state on sidebar folder rows**

```tsx
// BEFORE (line ~131):
className={`px-4 py-2 flex justify-between items-center cursor-pointer hover:bg-white/50 ${selected === String(folder._id) ? "bg-white/50 font-semibold" : ""}`}

// AFTER:
className={`px-3 py-2 flex justify-between items-center cursor-pointer rounded-lg transition-colors duration-150 hover:bg-white/60 ${selected === String(folder._id) ? "bg-indigo-50 text-indigo-700 font-semibold" : ""}`}
```

- [ ] **Step 3: Update the ChevronRight color to match**

```tsx
// BEFORE (line ~133):
<ChevronRight className="text-gray-500 size-4" />

// AFTER:
<ChevronRight className={`size-4 ${selected === String(folder._id) ? "text-indigo-500" : "text-gray-400"}`} />
```

- [ ] **Step 4: Verify visually**

Open File Explorer. Confirm:
- Sidebar has glass blur
- Clicking a folder turns the row indigo
- Hover rows have a light glass effect

- [ ] **Step 5: Commit**

```bash
git add src/components/webos/apps/file-explorer/file-explorer.tsx
git commit -m "feat(webos): glass sidebar + indigo selected state in file explorer"
```

---

## Task 6: Settings

**Files:**
- Modify: `src/components/webos/apps/settings.tsx`

- [ ] **Step 1: Glass root container + sidebar**

```tsx
// BEFORE (line ~17):
<div className="bg-white bg-opacity-70 backdrop-blur-md w-full h-full flex flex-col overflow-hidden">
  <div className="flex flex-1 overflow-hidden">
    <div className="w-64 bg-white bg-opacity-50 border-r border-gray-200 flex flex-col pb-2">

// AFTER:
<div className="bg-white/60 backdrop-blur-2xl w-full h-full flex flex-col overflow-hidden">
  <div className="flex flex-1 overflow-hidden">
    <div className="w-64 bg-white/50 backdrop-blur-xl border-r border-white/50 flex flex-col pb-2">
```

- [ ] **Step 2: Indigo selected state on sidebar section rows**

```tsx
// BEFORE (line ~37):
className={`px-4 py-2 flex justify-between items-center cursor-pointer hover:bg-gray-100 ${selected === sec ? "bg-gray-200 font-semibold" : ""}`}

// AFTER:
className={`px-3 py-2 flex justify-between items-center cursor-pointer rounded-lg transition-colors duration-150 hover:bg-white/60 ${selected === sec ? "bg-indigo-50 text-indigo-700 font-semibold" : ""}`}
```

- [ ] **Step 3: Indigo chevron on selected row**

```tsx
// BEFORE (line ~39):
<ChevronRight className="text-gray-500 size-4" />

// AFTER:
<ChevronRight className={`size-4 ${selected === sec ? "text-indigo-500" : "text-gray-400"}`} />
```

- [ ] **Step 4: Verify visually**

Open Settings. Confirm selected section row is indigo and sidebar is glassy.

- [ ] **Step 5: Commit**

```bash
git add src/components/webos/apps/settings.tsx
git commit -m "feat(webos): glass sidebar + indigo selected state in settings"
```

---

## Task 7: About + Clock

**Files:**
- Modify: `src/components/webos/apps/about.tsx`
- Modify: `src/components/webos/apps/clock.tsx`

- [ ] **Step 1: Replace About's arbitrary purple background + refine system info rows**

```tsx
// BEFORE (line ~31):
<div className="bg-purple-200 bg-opacity-70 p-6 w-full h-full gap-5 flex flex-col justify-center items-center text-gray-800 rounded-b-xl">
  <div className="flex items-center space-x-8 mb-4">
    <Image src="/gadgetOS.svg" alt="gadgetOS logo" height={64} width={64} className="rounded-full ring-4 ring-white/30" />
    <div className="space-y-1">
      <h2 className="text-2xl font-bold">GadgetOS</h2>
      <p className="text-sm text-gray-700">Version: {version}</p>
    </div>
  </div>
  <div className="space-y-1 mb-6 text-sm w-1/2 text-center">
    <p><span className="font-medium">Storage:</span> {storage}</p>
    <p><span className="font-medium">Resolution:</span> {resolution}</p>
    <p><span className="font-medium">Font:</span> {font}</p>
  </div>
</div>

// AFTER:
<div className="bg-white/60 backdrop-blur-2xl p-6 w-full h-full gap-5 flex flex-col justify-center items-center text-gray-800 rounded-b-xl">
  <div className="flex items-center space-x-8 mb-4">
    <Image src="/gadgetOS.svg" alt="gadgetOS logo" height={64} width={64} className="rounded-full ring-4 ring-white/30" />
    <div className="space-y-1">
      <h2 className="text-2xl font-bold">GadgetOS</h2>
      <p className="text-sm text-black/50">Version: {version}</p>
    </div>
  </div>
  <div className="bg-white/50 rounded-xl px-6 py-3 w-1/2 flex flex-col gap-2">
    {[
      { label: "Storage", value: storage },
      { label: "Resolution", value: resolution },
      { label: "Font", value: font },
    ].map(({ label, value }) => (
      <div key={label} className="flex justify-between items-center">
        <span className="text-black/50 text-xs uppercase tracking-wide">{label}</span>
        <span className="text-black/80 font-medium text-sm">{value}</span>
      </div>
    ))}
  </div>
</div>
```

- [ ] **Step 2: Replace Clock's arbitrary purple gradient with indigo**

```tsx
// BEFORE (line ~22):
<div className="bg-gradient-to-b from-purple-900 to-purple-800 h-full w-full flex flex-col justify-center items-center p-6 text-white">

// AFTER:
<div className="bg-gradient-to-b from-indigo-900 to-indigo-800 h-full w-full flex flex-col justify-center items-center p-6 text-white">
```

- [ ] **Step 3: Refine Clock typography**

```tsx
// BEFORE (line ~24):
<div className="text-5xl font-semibold">{time}</div>

// AFTER:
<div className="text-6xl font-thin tracking-tight">{time}</div>
```

- [ ] **Step 4: Polish Clock buttons**

```tsx
// BEFORE (lines ~28-33):
<button className="w-full flex items-center justify-center gap-2 bg-white/40 text-black rounded-lg py-2 text-sm">
  <Calendar size={16} /><span>Calendar</span>
</button>
<button className="w-full flex items-center justify-center gap-2 bg-white/40 text-black rounded-lg py-2 text-sm">
  <Settings size={16} /><span>Settings</span>
</button>

// AFTER:
<button className="w-full flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 border border-white/20 rounded-xl py-2 text-sm text-white transition-colors duration-150">
  <Calendar size={16} /><span>Calendar</span>
</button>
<button className="w-full flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 border border-white/20 rounded-xl py-2 text-sm text-white transition-colors duration-150">
  <Settings size={16} /><span>Settings</span>
</button>
```

- [ ] **Step 5: Verify visually**

Open About — should have a clean glass background. Open Clock — should have an indigo gradient and thinner time text.

- [ ] **Step 6: Commit**

```bash
git add src/components/webos/apps/about.tsx src/components/webos/apps/clock.tsx
git commit -m "feat(webos): replace arbitrary purple with indigo/glass in About + Clock"
```

---

## Task 8: Text Editor, Trash Bin + Context Menu

**Files:**
- Modify: `src/components/webos/apps/text-editor.tsx`
- Modify: `src/components/webos/apps/trash-bin.tsx`
- Modify: `src/components/webos/context-menu.tsx`

- [ ] **Step 1: Glass background + toolbar in Text Editor**

```tsx
// BEFORE (line ~74):
<div className="bg-white w-full h-full flex flex-col relative">
  <div className="flex items-center justify-between bg-white px-4 py-2 border-b">

// AFTER:
<div className="bg-white/60 backdrop-blur-2xl w-full h-full flex flex-col relative">
  <div className="flex items-center justify-between bg-white/80 backdrop-blur-sm px-4 py-2 border-b border-white/60">
```

- [ ] **Step 2: Inactive tab color in Text Editor**

```tsx
// BEFORE (line ~82):
className={`py-2 px-3 cursor-pointer text-sm ${id === activeId ? "border-b-2 border-indigo-500 text-indigo-600" : "text-gray-600"}`}

// AFTER:
className={`py-2 px-3 cursor-pointer text-sm transition-colors duration-150 ${id === activeId ? "border-b-2 border-indigo-500 text-indigo-600" : "text-black/40 hover:text-black/70"}`}
```

- [ ] **Step 3: Glass dialog overlay + card in Text Editor**

```tsx
// BEFORE (line ~104):
<div className="absolute inset-0 bg-black/30 flex items-center justify-center">
  <div className="bg-white/65 rounded-lg shadow-lg w-96">
    <div className="bg-white/50 border-b p-2 rounded-t-xl">

// AFTER:
<div className="absolute inset-0 bg-black/25 backdrop-blur-sm flex items-center justify-center">
  <div className="bg-white/80 backdrop-blur-2xl border border-white/60 rounded-2xl shadow-xl w-96">
    <div className="bg-white/50 border-b border-white/60 p-2 rounded-t-2xl">
```

- [ ] **Step 4: Indigo Save/Cancel buttons in Text Editor dialog**

```tsx
// BEFORE (lines ~129-130):
<Button onClick={() => setShowDialog(false)} className="px-3 h-8 text-xs bg-black/60">Cancel</Button>
<Button onClick={() => void handleSave()} className="px-3 h-8 text-xs bg-black/60">Save</Button>

// AFTER:
<Button onClick={() => setShowDialog(false)} className="px-3 h-8 text-xs bg-white/60 text-black/70 hover:bg-white/80 border border-white/60">Cancel</Button>
<Button onClick={() => void handleSave()} className="px-3 h-8 text-xs bg-indigo-600 hover:bg-indigo-700 text-white">Save</Button>
```

- [ ] **Step 5: Better Trash Bin empty state**

Replace the entire return:

```tsx
// BEFORE:
export default function TrashBinApp() {
  return (
    <div className="flex items-center justify-center w-full h-full text-sm text-gray-500">
      Trash Bin is empty.
    </div>
  );
}

// AFTER:
export default function TrashBinApp() {
  return (
    <div className="bg-white/60 backdrop-blur-2xl flex flex-col items-center justify-center w-full h-full gap-3 rounded-b-xl">
      <span className="text-5xl opacity-20">🗑️</span>
      <p className="text-sm text-black/35">Trash Bin is empty</p>
    </div>
  );
}
```

- [ ] **Step 6: Glass context menu**

```tsx
// BEFORE (line ~10):
<ContextMenuContent className="w-48">

// AFTER:
<ContextMenuContent className="w-48 bg-white/70 backdrop-blur-2xl border border-white/60 shadow-xl rounded-xl">
```

- [ ] **Step 7: Verify visually**

- Open Text Editor — toolbar should be slightly frosted, tabs match indigo, dialog buttons are now indigo/glass
- Open Trash Bin — shows centered trash icon with soft text
- Right-click the desktop — context menu should be glassy with rounded corners

- [ ] **Step 8: Commit**

```bash
git add src/components/webos/apps/text-editor.tsx src/components/webos/apps/trash-bin.tsx src/components/webos/context-menu.tsx
git commit -m "feat(webos): glass text editor + trash empty state + glass context menu"
```

---

## Done

All 8 tasks complete. The full WebOS UI is now macOS-inspired light with:
- Frosted glass windows, navbar, dock, and popovers
- Indigo accent throughout (selected states, prompt, active indicators)
- Dark terminal (#0d1117 background, indigo prompt, green output)
- Thinner typography on lock screen and clock
- 200ms window entrance animation
- Consistent hover transitions (150ms) across all sidebar rows
