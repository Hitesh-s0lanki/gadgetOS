# Chat Module Design

**Date:** 2026-04-05
**Branch:** features/webos-integration
**Phase:** 1 — Simple AI Assistant

---

## Overview

Add a Chat application to the WebOS dock that provides a persistent, streaming AI assistant powered by `gpt-4o`. The app follows the exact same windowed app pattern as all existing apps (Terminal, Browser, etc.).

---

## Requirements

- **Model:** `gpt-4o` via Vercel AI SDK + `@ai-sdk/openai`
- **API key:** `OPENAI_API_KEY` from environment variable (server-side only)
- **Streaming:** Yes — tokens appear in real time using Vercel AI SDK's data stream protocol
- **Persistence:** Messages stored in Convex (`chatMessages` table); one continuous global thread
- **No new/clear chat:** Single continuous thread for phase 1
- **Dock icon:** `ai.svg` (already exists in `/public`)

---

## Architecture

```
User types message
    ↓
useChat hook (Vercel AI SDK) — manages messages + input state
    ↓
POST /api/chat  (Next.js route handler)
    ├── Reads full conversation history from Convex
    ├── Calls streamText({ model: openai("gpt-4o"), messages })
    └── Returns streaming response (data stream protocol)
    ↓
useChat receives streamed tokens → updates UI in real time
    ↓
On stream complete → save assistant message to Convex
```

---

## File Structure

| File | Action | Purpose |
|------|--------|---------|
| `src/hooks/webos/use-chat.ts` | Create | `createWindowStore("Chat")` — window open/close/minimize state |
| `src/components/webos/apps/chat.tsx` | Create | Chat UI — message list, input, streaming display |
| `src/app/api/chat/route.ts` | Create | Streaming API route using Vercel AI SDK `streamText` |
| `convex/chat.ts` | Create | `getMessages` query + `addMessage` mutation |
| `src/components/webos/providers/window-provider.tsx` | Edit | Register `WindowBase` for Chat app |
| `src/components/webos/desktop/taskbar.tsx` | Edit | Add Chat entry to dock with `ai.svg` |

---

## Convex Schema

New table added to `convex/schema.ts`:

```ts
chatMessages: defineTable({
  role: v.union(v.literal("user"), v.literal("assistant")),
  content: v.string(),
})
```

No `userId` scoping in phase 1 — single global thread.

### Convex functions (`convex/chat.ts`)

- `getMessages` — query, returns all messages ordered by `_creationTime`
- `addMessage` — mutation, inserts `{ role, content }`

---

## API Route (`/api/chat/route.ts`)

```
POST /api/chat
Body: { messages: Message[] }

1. Fetch full history from Convex
2. Merge with incoming messages
3. Call streamText({ model: openai("gpt-4o"), messages })
4. Return stream using toDataStreamResponse()
```

Uses `OPENAI_API_KEY` from `process.env` — never exposed to client.

---

## Chat Component (`chat.tsx`)

### Layout

```
┌─────────────────────────────────┐
│  [●] [●] [●]  AI Assistant      │  ← WindowBase title bar
├─────────────────────────────────┤
│                                 │
│  [assistant] Hello! How can...  │
│                    [user] Hi    │
│  [assistant] Sure, I can...     │
│                                 │
│  (auto-scrolls to bottom)       │
│                                 │
├─────────────────────────────────┤
│  [input field............] [▶]  │
└─────────────────────────────────┘
```

### Behaviour

- `useChat` from `ai/react` manages local message state and streaming
- `initialMessages` loaded from Convex on mount
- On `onFinish` callback: save assistant message to Convex via mutation
- On user submit: save user message to Convex via mutation
- User messages: right-aligned, accent background
- Assistant messages: left-aligned, subtle background
- Input disabled while `isLoading` (streaming in progress)
- Auto-scroll to bottom ref on every message update

### Window size

`w-[600px] h-[500px]` — consistent with Text Editor.

---

## Dock Integration

**`taskbar.tsx`** — new entry in `links` array:

```ts
{ title: "Chat", icon: <Image src="/ai.svg" ... />, onClick: openChat, isOpen: chatOpen }
```

**`window-provider.tsx`** — new `WindowBase`:

```tsx
<WindowBase store={useChat} defaultPosition={{ x: 220, y: 90 }} width="w-[600px]" height="h-[500px]">
  <ChatApp />
</WindowBase>
```

---

## Dependencies to Install

```bash
npm install ai @ai-sdk/openai
```

The `openai` package (v6.33.0) is already installed; `@ai-sdk/openai` is a thin adapter over it.

---

## Phase 2 Considerations (out of scope now)

- System prompt customization
- Multiple named conversations
- Tool use / function calling
- File/image attachments
- Model selector in UI
