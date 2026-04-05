# GadgetOS WebOS UI Overhaul — Design Spec

**Date:** 2026-04-05  
**Branch:** features/webos-integration  
**Scope:** Full UI overhaul — all WebOS components

---

## Design Direction

**macOS-inspired light** with frosted glass panels, soft drop shadows, and an **indigo** (`#6366f1`) accent color throughout. Every surface that currently uses `bg-white` or `bg-gray-100` becomes a translucent, blurred glass panel. Dark terminal stays dark. Animations are subtle and fast (150–250ms).

---

## 1. Design Tokens

Add to `src/app/globals.css` (or `tailwind.config.ts` theme extension). All components reference these rather than hardcoding values.

| Token | Value | Usage |
|---|---|---|
| `--glass-bg` | `rgba(255,255,255,0.60)` | Window body |
| `--glass-nav` | `rgba(255,255,255,0.35)` | Navbar, dock |
| `--glass-panel` | `rgba(255,255,255,0.50)` | App sidebars |
| `--glass-border` | `rgba(255,255,255,0.65)` | All glass borders |
| `--blur-sm` | `16px` | Dock, datetime pill |
| `--blur-md` | `24px` | Navbar, lock screen |
| `--blur-lg` | `28px` | Windows |
| `--accent` | `#6366f1` | Indigo-500 |
| `--accent-bg` | `rgba(99,102,241,0.10)` | Selected sidebar rows |
| `--accent-text` | `#4338ca` | Indigo-700 |
| `--shadow-window` | `0 8px 40px rgba(0,0,0,0.18), 0 1px 0 rgba(255,255,255,0.8) inset` | Window |
| `--shadow-dock` | `0 4px 24px rgba(0,0,0,0.15), 0 1px 0 rgba(255,255,255,0.8) inset` | Dock/pills |
| `--duration-fast` | `150ms` | Hover transitions |
| `--duration-normal` | `200ms` | Window entrance |

In Tailwind terms, use these as utility class equivalents:
- Glass window body → `bg-white/60 backdrop-blur-2xl`
- Glass navbar/dock → `bg-white/35 backdrop-blur-2xl`
- Glass sidebar panel → `bg-white/50 backdrop-blur-xl`
- Glass title bar → `bg-white/55 backdrop-blur-2xl`
- Border → `border border-white/65`

---

## 2. Window Chrome (`window-base.tsx`)

**Current:** `bg-white` body, `bg-gray-100 border-b` title bar, `shadow-xl`  
**New:**

- **Window container:** `bg-white/60 backdrop-blur-2xl rounded-xl border border-white/65 shadow-[0_8px_40px_rgba(0,0,0,0.18)] ring-1 ring-white/30`
- **Title bar:** `bg-white/55 backdrop-blur-2xl border-b border-white/60 rounded-t-xl`
- **Title text:** `text-sm font-semibold text-black/65` (centered, only responds to drag)
- **Traffic lights:** unchanged (red/yellow/green — already correct)
- **Entrance animation:** wrap the portal render in `animate-in fade-in-0 zoom-in-95 duration-200` (uses `tw-animate-css` which is already installed)
- **No exit animation needed** — removal is instant, adding a delayed unmount adds complexity without value

---

## 3. Navbar (`navbar.tsx`)

**Current:** `bg-white/30` no border, basic popovers  
**New:**

- **Bar:** `bg-white/35 backdrop-blur-2xl border-b border-white/50 h-8`
- **GadgetOS button:** `text-sm font-semibold text-black/70 hover:bg-white/30 rounded-md px-2 py-0.5`
- **System tray popover content:** `bg-white/70 backdrop-blur-2xl border border-white/60 rounded-2xl shadow-xl p-4`  
  - Control grid buttons: `bg-white/60 hover:bg-white/90 rounded-full p-2 transition-colors duration-150`
- **Icons in trigger:** existing wifi/sound/battery SVGs kept, add `opacity-70` so they read as system UI, not prominent CTAs

---

## 4. Taskbar Date-Time Pill (`date-time.tsx`)

**Current:** `bg-white/40 h-16 rounded-2xl px-4` — too tall, no blur, no border  
**New:**

- `bg-white/35 backdrop-blur-[16px] border border-white/60 rounded-xl px-4 py-2 shadow-[0_4px_24px_rgba(0,0,0,0.12)]`
- Height becomes `h-auto` (content-sized, ~40px) to match the dock height
- Font: `text-sm font-semibold text-black/75` for time, `text-sm text-black/50` for date

---

## 5. Lock Screen (`lock-screen.tsx`)

**Current:** `bg-black/70` hard overlay  
**New:**

- Overlay: `bg-black/40 backdrop-blur-2xl` — lets the wallpaper show through softly
- Time: `text-8xl font-thin tracking-tight` (lighter weight, bigger)
- Date: `text-lg font-medium opacity-80`
- Unlock hint: `text-xs opacity-50 mt-6 tracking-widest uppercase` — more refined, less obvious
- Add a subtle `animate-pulse` to the unlock hint for discoverability

---

## 6. Terminal App (`terminal.tsx`)

**Current:** `bg-white text-gray-900` — completely wrong for a terminal  
**New:**

- Container: `bg-[#0d1117] text-[#e6edf3]` (GitHub dark palette)
- Prompt: `text-indigo-400` (was `text-blue-600`)
- Command text: `text-[#e6edf3]`
- Output lines: `text-[#3fb950]` (green — success output)
- Error output: `text-[#f85149]` (red)
- Dim/info output: `text-[#8b949e]`
- Input: `bg-transparent text-[#e6edf3] caret-indigo-400`
- Scrollbar: inline CSS `scrollbarWidth: 'thin'` and `scrollbarColor: 'rgba(255,255,255,0.2) transparent'` on the container div (`tailwind-scrollbar` is not installed)

---

## 7. File Explorer (`file-explorer.tsx`)

**Current:** `bg-white bg-opacity-70 backdrop-blur-md`, selected row `bg-white/50 font-semibold`  
**New:**

- Root container: `bg-white/60 backdrop-blur-2xl`
- Sidebar panel: `bg-white/50 backdrop-blur-xl border-r border-white/50`
- Selected row: `bg-indigo-50 text-indigo-700 font-semibold rounded-lg`
- Hover row: `hover:bg-white/60 rounded-lg transition-colors duration-150`
- Search input: `bg-white/70 border border-white/60 rounded-lg focus:ring-1 focus:ring-indigo-400`
- Empty/home state: center the icon with a larger `rounded-2xl bg-indigo-50 p-5` container instead of plain layout

---

## 8. Settings App (`settings.tsx`)

**Current:** `bg-white bg-opacity-70 backdrop-blur-md`, selected row `bg-gray-200 font-semibold`  
**New:**

- Root + sidebar: same glass treatment as File Explorer
- Selected row: `bg-indigo-50 text-indigo-700 font-semibold rounded-lg` (replacing `bg-gray-200`)
- Hover row: `hover:bg-white/60 rounded-lg transition-colors duration-150`
- Search input: same as file explorer
- `ChevronRight` on selected row: `text-indigo-500` (was `text-gray-500`)

---

## 9. About App (`about.tsx`)

**Current:** `bg-purple-200 bg-opacity-70` — arbitrary purple, inconsistent with rest of OS  
**New:**

- Container: `bg-white/60 backdrop-blur-2xl` (consistent with window body)
- Logo: keep `ring-4 ring-white/30`
- System info rows: `bg-white/50 rounded-xl px-6 py-3` card instead of plain text list
- Each row: label in `text-black/50 text-xs uppercase tracking-wide`, value in `text-black/80 font-medium text-sm`

---

## 10. Clock App (`clock.tsx`)

**Current:** `bg-gradient-to-b from-purple-900 to-purple-800` — arbitrary purple  
**New:**

- Background: `bg-gradient-to-b from-indigo-900 to-indigo-800` (indigo, consistent with accent)
- Time: `text-6xl font-thin tracking-tight` (thinner weight, feels more premium)
- Buttons: `bg-white/20 hover:bg-white/30 border border-white/20 rounded-xl text-white transition-colors duration-150`

---

## 11. Text Editor (`text-editor.tsx`)

**Current:** `bg-white` toolbar, plain `border-b`  
**New:**

- Toolbar: `bg-white/80 backdrop-blur-sm border-b border-white/60`
- Active tab: `border-b-2 border-indigo-500 text-indigo-600` (already uses indigo — keep)
- Inactive tab: `text-black/40 hover:text-black/70 transition-colors duration-150`
- Textarea: `bg-white/50 font-mono text-sm` — slight glass tint instead of pure white
- Save dialog overlay: `bg-black/25 backdrop-blur-sm`
- Save dialog card: `bg-white/80 backdrop-blur-2xl border border-white/60 rounded-2xl shadow-xl`
- Buttons: `bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg` (replace `bg-black/60`)

---

## 12. Trash Bin (`trash-bin.tsx`)

**Current:** Plain gray text "Trash Bin is empty."  
**New:**

- Center column: icon (`🗑️` or SVG) at `text-5xl opacity-20`, then `text-sm text-black/35 mt-3`
- Background: `bg-white/60 backdrop-blur-2xl` (consistent)

---

## 13. Context Menu (`context-menu.tsx`)

The `ContextMenuContent` from shadcn accepts `className`. Override it:

- `className="bg-white/70 backdrop-blur-2xl border border-white/60 shadow-xl rounded-xl"`
- Menu items: `hover:bg-indigo-50 hover:text-indigo-700 rounded-lg transition-colors duration-150`

---

## 14. Animations Summary

All animations use Tailwind CSS `animate-in` utilities (already available via `tailwindcss-animate` included with shadcn):

| Location | Animation |
|---|---|
| Window open | `animate-in fade-in-0 zoom-in-95 duration-200` on the portal `div` |
| Lock screen unlock click | Natural Next.js navigation — no extra animation needed |
| Dock items hover | FloatingDock handles its own hover — no change needed |
| Sidebar row hover | `transition-colors duration-150` |
| Navbar popover | shadcn already animates — no change needed |
| Lock screen hint | `animate-pulse` on the "Click anywhere" text |

---

## 15. File Change Map

| File | Changes |
|---|---|
| `globals.css` | Add CSS custom properties (tokens) |
| `window-base.tsx` | Glass body + title bar + entrance animation |
| `navbar.tsx` | Stronger blur + border + popover polish |
| `date-time.tsx` | Glass pill sizing fix |
| `lock-screen.tsx` | Blur overlay + typography + pulse hint |
| `terminal.tsx` | Full dark theme |
| `file-explorer.tsx` | Indigo selected state + glass sidebar |
| `settings.tsx` | Indigo selected state + glass sidebar |
| `about.tsx` | Consistent glass + indigo accent |
| `clock.tsx` | Indigo gradient + thinner typography |
| `text-editor.tsx` | Toolbar glass + indigo buttons |
| `trash-bin.tsx` | Better empty state |
| `context-menu.tsx` | Glass + indigo menu items |

No new files, no new dependencies, no refactoring of logic — purely CSS/className changes and the entrance animation.

---

## Success Criteria

- Every window surface is frosted glass (no solid white/gray backgrounds)
- Indigo is the only accent color across all interactive/selected states
- Terminal is dark (`#0d1117`) with correct prompt and output colors
- Window entrance has a 200ms fade+scale animation
- Lock screen overlay is translucent (shows wallpaper through blur)
- All hover transitions are 150ms or less
- No new npm packages required
