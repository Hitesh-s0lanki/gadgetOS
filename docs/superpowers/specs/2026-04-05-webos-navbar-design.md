# GadgetOS WebOS Navbar — Design Spec

**Date:** 2026-04-05
**Branch:** features/webos-integration
**Scope:** Full navbar overhaul — live clock, working control center, voice control, sleep overlay, brightness overlay

---

## 1. Goals

Replace the current static navbar with a fully functional three-zone menu bar:
- **Left** — GadgetOS power menu (Shutdown, Restart, Sleep) with real actions
- **Center** — Live clock updated every second
- **Right** — System tray that opens a unified Control Center with expandable sections, real browser API data, and working controls

---

## 2. Architecture

### 2.1 Zustand OS Store — `use-os-state.ts`

Single Zustand store for all OS-level state. Any component in the tree can read or write it.

```ts
interface OsState {
  // Toggle states
  wifiEnabled: boolean
  bluetoothEnabled: boolean
  airplaneModeEnabled: boolean
  batterySaverEnabled: boolean
  isMuted: boolean

  // Slider values (0–100)
  volume: number
  brightness: number

  // Overlay states
  isSleeping: boolean

  // Voice
  isListening: boolean

  // Real data — populated by browser API hooks
  batteryLevel: number        // 0.0–1.0
  isCharging: boolean
  chargingTime: number        // seconds, Infinity if not charging
  dischargingTime: number     // seconds, Infinity if charging
  networkType: string         // 'wifi' | '4g' | 'none' | 'unknown'
  networkDownlink: number     // Mbps
  bluetoothDevices: { id: string; name: string }[]
}
```

Default values: all toggles `true` except airplane/batterySaver/isSleeping/isListening (`false`), `volume: 70`, `brightness: 100`.

### 2.2 Browser API Hooks

Three hooks, each called once from `desktop-screen.tsx` on mount. They write real data into `useOsState`.

**`use-battery-info.ts`**
- Calls `navigator.getBattery()` on mount
- Reads `battery.level`, `battery.charging`, `battery.chargingTime`, `battery.dischargingTime`
- Attaches event listeners: `levelchange`, `chargingchange`, `chargingtimechange`, `dischargingtimechange`
- Updates `useOsState` on each event
- If API unavailable (Firefox, Safari), leaves defaults

**`use-network-info.ts`**
- Reads `(navigator as any).connection` (Chrome/Edge only)
- Reads `.effectiveType` (maps to `networkType`), `.downlink` (maps to `networkDownlink`)
- Listens to `change` event on the connection object
- Updates `useOsState` on change
- If API unavailable, sets `networkType: 'unknown'`

**`use-voice-control.ts`**
- Manages a `SpeechRecognition` instance (`webkitSpeechRecognition || SpeechRecognition`)
- `continuous: false`, `interimResults: false`, `lang: 'en-US'`
- Watches `useOsState.isListening` — starts/stops recognition accordingly
- On `result`: runs command matching (see Section 5)
- On `error`: if `not-allowed`, shows Sonner toast: `"Microphone access denied. Enable it in browser settings."`, sets `isListening: false`
- On `end`: if `isListening` still true, restarts (continuous listening)

### 2.3 Desktop Screen Changes

`desktop-screen.tsx` gets:
1. Mount the three API hooks: `useBatteryInfo()`, `useNetworkInfo()`, `useVoiceControl()`
2. `<BrightnessOverlay />` — `pointer-events-none fixed inset-0 z-[100] bg-black` with `opacity` = `(100 - brightness) / 100 * 0.85` (capped so it never goes fully black at brightness=0, max overlay opacity 0.85)
3. `<SleepOverlay />` — shown when `isSleeping: true`

---

## 3. Navbar Layout

```
┌─────────────────────────────────────────────────────────┐
│  GadgetOS ▾  │   Sat Apr 5  2:34 PM   │  📶  🔊  🔋  │
│    (left)    │        (center)         │    (right)    │
└─────────────────────────────────────────────────────────┘
```

**Bar styles:** `h-8 bg-white/35 backdrop-blur-2xl border-b border-white/50 w-full px-2 flex items-center justify-between`

### 3.1 Left — GadgetOS Menu

Popover triggered by "GadgetOS" text button. Three icon buttons in a row:

| Button | Icon | Action |
|---|---|---|
| Shutdown | `/icons/shut-down.svg` | `router.push('/webos/lock-screen')` |
| Restart | `/icons/restart.svg` | `window.location.reload()` |
| Sleep | `/icons/sleep.svg` | `useOsState.setState({ isSleeping: true })` |

Popover styles: `bg-white/70 backdrop-blur-2xl border border-white/60 rounded-2xl shadow-xl p-4`

### 3.2 Center — Live Clock

```tsx
<time className="text-sm font-medium text-black/70 absolute left-1/2 -translate-x-1/2">
  Sat Apr 5  2:34 PM
</time>
```

- `useEffect` with `setInterval(1000)` updates a `Date` state
- Format: `toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric' })` + `toLocaleTimeString('en-US', { hour:'numeric', minute:'2-digit', hour12:true })`
- Cleared on unmount

### 3.3 Right — System Tray Trigger

Single button showing three dynamic icons:
- **Wi-Fi:** `/icons/wifi.svg` normally; if `airplaneModeEnabled` or `!wifiEnabled`, show greyed icon with `opacity-30`
- **Sound:** `/icons/sound.svg` normally; if `isMuted`, `/icons/soundless.svg`
- **Battery:** static `/icons/battery.svg` (dynamic icon per level is a future enhancement)
- While `isListening`: add a pulsing red dot `animate-pulse bg-red-500 w-2 h-2 rounded-full` next to the icons

---

## 4. Control Center Panel (`control-center.tsx`)

Separate component rendered inside a `<PopoverContent>`. Width `w-72`, styles: `bg-white/70 backdrop-blur-2xl border border-white/60 rounded-2xl shadow-xl p-4 flex flex-col gap-4`.

### 4.1 Expandable Tiles Row (Wi-Fi, Bluetooth)

Two tiles side by side in a `grid grid-cols-2 gap-3`.

Each tile:
- Active: `bg-indigo-500 text-white rounded-2xl p-3`
- Inactive: `bg-white/60 text-black/70 rounded-2xl p-3`
- Shows icon + label + chevron
- Clicking the tile body toggles `expanded` local state (React `useState` inside the component)
- The chevron rotates 180° when expanded (`transition-transform duration-150`)

**Wi-Fi expanded section** (renders below the tiles row when `wifiExpanded`):
```
Connected · WiFi
↓ 45 Mbps
[Toggle Wi-Fi]  ← button that flips wifiEnabled (visual only)
```
Data from `useOsState.networkType` and `useOsState.networkDownlink`.

**Bluetooth expanded section** (renders below when `bluetoothExpanded`):
```
[Scan for devices]  ← calls navigator.bluetooth.requestDevice()
Device Name 1
Device Name 2
[Toggle Bluetooth]
```
`bluetoothDevices` list from `useOsState.bluetoothDevices`. If Web Bluetooth unavailable, show: `"Bluetooth scanning not supported in this browser."` Each device shown as `text-sm text-black/60` row.

### 4.2 Toggle Tiles Row

`grid grid-cols-3 gap-3` — each tile same active/inactive style as above, single tap flips the `useOsState` boolean:

| Tile | Icon | State key | Side effect |
|---|---|---|---|
| Mute | soundless.svg | `isMuted` | Sets `volume` to 0 when muting; restores previous on unmute |
| Screenshot | screenshot.svg | — (no toggle) | Calls `captureScreenshot()` immediately |
| Airplane | plane-mode.svg | `airplaneModeEnabled` | Also sets `wifiEnabled: false, bluetoothEnabled: false` when enabling |
| Battery Saver | battery-saver.svg | `batterySaverEnabled` | Also sets `brightness: 50` when enabling |
| Voice | mic icon (tabler) | `isListening` | Starts/stops SpeechRecognition |

### 4.3 Sliders

Two slider rows:

```
🔆  [──────●──────────]  85%
🔊  [──────────●──────]  60%
```

- shadcn `<Slider>` component, `min=0 max=100 step=1`
- Brightness: reads/writes `useOsState.brightness`
- Volume: reads/writes `useOsState.volume`. Also sets `isMuted: false` if dragged above 0.

### 4.4 Battery Row

```
🔋 72%  ·  Charging — 1h 23m remaining
```

- `batteryLevel * 100` rounded to integer for percentage
- `isCharging ? 'Charging' : 'On battery'`
- Time: convert `chargingTime` or `dischargingTime` seconds → `Xh Ym` format. If `Infinity`, show `"Calculating…"`
- If Battery API unavailable: show `"Battery info unavailable"`

---

## 5. Voice Control Command System

Two-pass matching in `use-voice-control.ts`:

### Pass 1 — Keyword matching (no API call)

```
transcript.toLowerCase().trim()
```

| Pattern | Action |
|---|---|
| includes `"open terminal"` | `useTerminal.getState().onOpen()` |
| includes `"open browser"` | `useBrowser.getState().onOpen()` |
| includes `"open files"` or `"open file explorer"` | `useFileExplorer.getState().onOpen()` |
| includes `"open settings"` | `useSettings.getState().onOpen()` |
| includes `"open clock"` | `useClock.getState().onOpen()` |
| includes `"open editor"` or `"open text editor"` | `useTextEditor.getState().onOpen()` |
| includes `"open trash"` | `useTrashBin.getState().onOpen()` |
| includes `"close"` | focuses on top window — future; for now, no-op with toast |
| includes `"lock"` or `"sleep"` | `useOsState.setState({ isSleeping: true })` |
| includes `"shutdown"` | `router.push('/webos/lock-screen')` — note: hook needs router, pass as param |
| includes `"restart"` | `window.location.reload()` |
| includes `"mute"` | `useOsState.setState({ isMuted: true })` |
| includes `"unmute"` | `useOsState.setState({ isMuted: false })` |
| includes `"volume up"` | `volume = Math.min(100, volume + 10)` |
| includes `"volume down"` | `volume = Math.max(0, volume - 10)` |
| includes `"screenshot"` | calls `captureScreenshot()` |
| includes `"brightness up"` | `brightness = Math.min(100, brightness + 10)` |
| includes `"brightness down"` | `brightness = Math.max(0, brightness - 10)` |

On match: show Sonner toast `"✓ <command recognized>"` in bottom-right.

### Pass 2 — AI fallback

If no keyword matched, POST `{ message: transcript }` to `/api/openai-terminal`. Show response as a Sonner toast (info style). This reuses the existing AI endpoint — no new route needed.

---

## 6. Sleep Overlay

Component: `<SleepOverlay />` in `desktop-screen.tsx`.

```
fixed inset-0 z-[9999] bg-black/95 backdrop-blur-sm
flex flex-col items-center justify-center
cursor-pointer
```

Content:
```
2:34 PM                    ← text-8xl font-thin text-white/90
Saturday, April 5          ← text-xl font-light text-white/50 mt-2
                           ← mt-12 gap
CLICK ANYWHERE TO WAKE     ← text-xs tracking-widest text-white/30 animate-pulse uppercase
```

Click handler: `useOsState.setState({ isSleeping: false })`

Only renders when `isSleeping === true`. No animation needed — instant show/hide.

---

## 7. Screenshot Utility

`src/lib/screenshot.ts` — exported `captureScreenshot()` function:

```ts
import html2canvas from 'html2canvas'

export async function captureScreenshot(): Promise<void> {
  const canvas = await html2canvas(document.body)
  const link = document.createElement('a')
  link.download = `gadgetos-${Date.now()}.png`
  link.href = canvas.toDataURL()
  link.click()
}
```

Called by the Screenshot tile click handler and the voice command handler.
New npm dependency: `html2canvas`.

---

## 8. File Map

| File | Status | Notes |
|---|---|---|
| `src/hooks/webos/use-os-state.ts` | **New** | Zustand OS store |
| `src/hooks/webos/use-battery-info.ts` | **New** | Battery API hook |
| `src/hooks/webos/use-network-info.ts` | **New** | Network API hook |
| `src/hooks/webos/use-voice-control.ts` | **New** | Speech Recognition hook |
| `src/components/webos/desktop/navbar.tsx` | **Rewrite** | 3-zone layout |
| `src/components/webos/desktop/control-center.tsx` | **New** | Control Center panel |
| `src/components/webos/desktop/desktop-screen.tsx` | **Edit** | Add overlays + API hooks |
| `src/lib/screenshot.ts` | **New** | html2canvas capture utility |

New npm package: `html2canvas`

---

## 9. Success Criteria

- Live clock in navbar center updates every second
- Shutdown navigates to `/webos/lock-screen`, Restart reloads, Sleep shows overlay
- Sleep overlay dismissed by click
- Control Center opens from right tray; Wi-Fi and Bluetooth rows expand inline
- Battery row shows real level, charging status, and time remaining
- Network row shows real connection type and downlink speed
- Bluetooth Scan button triggers real Web Bluetooth device picker
- Brightness slider visually dims the entire desktop
- Volume slider value persists in OS store
- Mute/Airplane/BatterySaver toggles flip correctly with side effects
- Voice control: mic activates on tile click, recognized commands execute, unknown → AI toast
- Screenshot tile downloads a PNG of the desktop
- Mic permission denial shows a toast
- All controls use the glass design tokens (`bg-white/70 backdrop-blur-2xl` etc.)
