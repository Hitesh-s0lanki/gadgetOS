# Chat Module Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a persistent, streaming AI chat assistant app to the WebOS dock using Vercel AI SDK + `gpt-4o`, with messages stored in Convex.

**Architecture:** A Next.js API route (`/api/chat`) uses Vercel AI SDK `streamText` to stream `gpt-4o` responses. The chat component uses `useChat` from `ai/react` for streaming state management, loading initial history from Convex on mount and persisting each message via Convex mutations. The app follows the existing WebOS windowed app pattern exactly.

**Tech Stack:** Vercel AI SDK (`ai`, `@ai-sdk/openai`), OpenAI `gpt-4o`, Convex (persistence), Next.js App Router route handler, Zustand (window state via `createWindowStore`), React

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `src/hooks/webos/use-chat.ts` | **Create** | Window open/close/minimize state |
| `convex/schema.ts` | **Modify** | Add `chatMessages` table |
| `convex/chat.ts` | **Create** | `getMessages` query + `addMessage` mutation |
| `src/app/api/chat/route.ts` | **Create** | Streaming API route with `streamText` |
| `src/components/webos/apps/chat.tsx` | **Create** | Chat UI with streaming display |
| `src/components/webos/providers/window-provider.tsx` | **Modify** | Register `WindowBase` for Chat |
| `src/components/webos/desktop/taskbar.tsx` | **Modify** | Add Chat icon to dock |

---

## Task 1: Install Dependencies

**Files:** `package.json` (modified by npm)

- [ ] **Step 1: Install Vercel AI SDK packages**

```bash
npm install ai @ai-sdk/openai
```

Expected output: packages added successfully with no peer dependency errors.

- [ ] **Step 2: Verify installation**

```bash
cat package.json | grep -E '"ai"|"@ai-sdk"'
```

Expected: both `"ai"` and `"@ai-sdk/openai"` appear in dependencies.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: install ai and @ai-sdk/openai for chat module"
```

---

## Task 2: Add Convex Schema for Chat Messages

**Files:**
- Modify: `convex/schema.ts`

- [ ] **Step 1: Add `chatMessages` table to the schema**

Open `convex/schema.ts`. After the `browserHistory` table definition and before the closing `});`, add:

```ts
  chatMessages: defineTable({
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
  }),
```

The full file should look like:

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

  bookmarks: defineTable({
    url: v.string(),
    title: v.string(),
  }),

  browserHistory: defineTable({
    url: v.string(),
    title: v.string(),
    visitedAt: v.number(),
  }),

  chatMessages: defineTable({
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
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

- [ ] **Step 2: Commit**

```bash
git add convex/schema.ts
git commit -m "feat(convex): add chatMessages table to schema"
```

---

## Task 3: Create Convex Chat Functions

**Files:**
- Create: `convex/chat.ts`

- [ ] **Step 1: Create the file with `getMessages` query and `addMessage` mutation**

```ts
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getMessages = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("chatMessages").order("asc").collect();
  },
});

export const addMessage = mutation({
  args: {
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
  },
  handler: async (ctx, { role, content }) => {
    return await ctx.db.insert("chatMessages", { role, content });
  },
});
```

- [ ] **Step 2: Push schema + functions to Convex**

```bash
npx convex dev --once
```

Expected: no errors, Convex dashboard shows `chatMessages` table and `chat` functions.

- [ ] **Step 3: Commit**

```bash
git add convex/chat.ts convex/_generated/
git commit -m "feat(convex): add chat getMessages query and addMessage mutation"
```

---

## Task 4: Create the Window Store Hook

**Files:**
- Create: `src/hooks/webos/use-chat.ts`

- [ ] **Step 1: Create the hook**

```ts
import { createWindowStore } from "./create-window-store";
export const useChat = createWindowStore("Chat");
```

- [ ] **Step 2: Verify lint passes**

```bash
npm run lint
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/webos/use-chat.ts
git commit -m "feat: add useChat window store hook"
```

---

## Task 5: Create the API Route

**Files:**
- Create: `src/app/api/chat/route.ts`

- [ ] **Step 1: Create the streaming route handler**

```ts
import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai("gpt-4o"),
    system: "You are a helpful AI assistant built into GadgetOS. Be concise and friendly.",
    messages,
  });

  return result.toDataStreamResponse();
}
```

> **Note:** `OPENAI_API_KEY` must be set in `.env.local`. The `@ai-sdk/openai` adapter reads it automatically from `process.env.OPENAI_API_KEY`.

- [ ] **Step 2: Verify lint passes**

```bash
npm run lint
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/chat/route.ts
git commit -m "feat: add /api/chat streaming route with gpt-4o"
```

---

## Task 6: Create the Chat UI Component

**Files:**
- Create: `src/components/webos/apps/chat.tsx`

- [ ] **Step 1: Create the chat component**

```tsx
"use client";

import { useEffect, useRef } from "react";
import { useChat as useAIChat } from "ai/react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Send } from "lucide-react";

export default function ChatApp() {
  const storedMessages = useQuery(api.chat.getMessages);
  const addMessage = useMutation(api.chat.addMessage);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages } = useAIChat({
    api: "/api/chat",
    onFinish: async (message) => {
      await addMessage({ role: "assistant", content: message.content });
    },
  });

  // Load persisted messages from Convex into useChat on first mount
  useEffect(() => {
    if (storedMessages && storedMessages.length > 0 && messages.length === 0) {
      setMessages(
        storedMessages.map((m) => ({
          id: m._id,
          role: m.role,
          content: m.content,
        }))
      );
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storedMessages]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    await addMessage({ role: "user", content: input });
    handleSubmit(e);
  };

  return (
    <div className="bg-white/60 backdrop-blur-2xl w-full h-full flex flex-col overflow-hidden">
      {/* Message list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm select-none">
            Ask me anything...
          </div>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm leading-relaxed whitespace-pre-wrap break-words ${
                m.role === "user"
                  ? "bg-indigo-500 text-white rounded-br-sm"
                  : "bg-white/80 text-gray-800 border border-white/50 rounded-bl-sm shadow-sm"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white/80 border border-white/50 rounded-2xl rounded-bl-sm px-4 py-2 shadow-sm">
              <span className="flex gap-1 items-center">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
              </span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <form
        onSubmit={onSubmit}
        className="border-t border-white/50 p-3 flex gap-2 bg-white/40 backdrop-blur-xl"
      >
        <input
          value={input}
          onChange={handleInputChange}
          disabled={isLoading}
          placeholder="Type a message..."
          className="flex-1 bg-white/70 border border-white/50 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="bg-indigo-500 hover:bg-indigo-600 disabled:opacity-40 text-white rounded-xl px-3 py-2 transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
```

- [ ] **Step 2: Verify lint passes**

```bash
npm run lint
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/webos/apps/chat.tsx
git commit -m "feat: add ChatApp component with streaming and Convex persistence"
```

---

## Task 7: Register Chat in Window Provider

**Files:**
- Modify: `src/components/webos/providers/window-provider.tsx`

- [ ] **Step 1: Add import for `useChat` hook and `ChatApp` component**

At the top of `src/components/webos/providers/window-provider.tsx`, add these two imports alongside the existing ones:

```ts
import { useChat } from "@/hooks/webos/use-chat";
import ChatApp from "@/components/webos/apps/chat";
```

- [ ] **Step 2: Add `WindowBase` for Chat inside the `WindowProvider` return**

Inside the `<>...</>` fragment in the `WindowProvider` component return (after the `useTrashBin` `WindowBase` and before `<ImagePreviewWindow />`), add:

```tsx
<WindowBase store={useChat} defaultPosition={{ x: 220, y: 90 }} width="w-[600px]" height="h-[500px]">
  <ChatApp />
</WindowBase>
```

- [ ] **Step 3: Verify lint passes**

```bash
npm run lint
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/webos/providers/window-provider.tsx
git commit -m "feat: register ChatApp in WindowProvider"
```

---

## Task 8: Add Chat Icon to the Dock

**Files:**
- Modify: `src/components/webos/desktop/taskbar.tsx`

- [ ] **Step 1: Add `useChat` import**

At the top of `src/components/webos/desktop/taskbar.tsx`, add:

```ts
import { useChat } from "@/hooks/webos/use-chat";
```

- [ ] **Step 2: Destructure `openChat` and `chatOpen` from the hook**

Inside the `Taskbar` function body, add alongside the other hook calls:

```ts
const { onOpen: openChat, isOpen: chatOpen } = useChat();
```

- [ ] **Step 3: Add the Chat entry to the `links` array**

In the `links` array, add a new entry (position it logically, e.g. after the Browser entry):

```ts
{ title: "Chat", icon: <Image src="/ai.svg" alt="Chat" width={50} height={50} className="h-full w-full" />, onClick: openChat, isOpen: chatOpen },
```

- [ ] **Step 4: Verify lint passes**

```bash
npm run lint
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/webos/desktop/taskbar.tsx
git commit -m "feat: add Chat icon to WebOS dock"
```

---

## Task 9: End-to-End Verification

- [ ] **Step 1: Ensure `OPENAI_API_KEY` is set**

```bash
grep OPENAI_API_KEY .env.local
```

Expected: `OPENAI_API_KEY=sk-...` present. If not, add it to `.env.local`.

- [ ] **Step 2: Start dev server**

```bash
npm run dev
```

Open `http://localhost:3001` in the browser.

- [ ] **Step 3: Verify dock icon appears**

The AI chat icon (`ai.svg`) should appear in the floating dock at the bottom of the desktop.

- [ ] **Step 4: Open the Chat window**

Click the Chat icon. A `600×500` window titled "Chat" should open, draggable, with close/minimize buttons.

- [ ] **Step 5: Send a message and verify streaming**

Type "Hello, what can you do?" and press Enter or click Send. Verify:
- The typing indicator (three bouncing dots) appears immediately
- Response streams in token-by-token
- After completion, input re-enables

- [ ] **Step 6: Verify persistence**

Close the Chat window, reopen it. The conversation history should still be visible (loaded from Convex).

- [ ] **Step 7: Final commit**

```bash
git add .
git commit -m "feat: complete chat module — AI assistant with dock icon and Convex persistence"
```
