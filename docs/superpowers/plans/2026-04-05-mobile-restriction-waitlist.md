# Mobile Demo Restriction & Waitlist Persistence Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Block mobile users from the WebOS demo with a friendly desktop-only page, and persist waiting list emails to Convex with duplicate detection.

**Architecture:** Add a `waitlist` Convex table + mutation for email persistence; convert `/demo` to a client component that checks viewport width on mount and either redirects to `/webos/lock-screen` (desktop) or renders a desktop-only UI (mobile).

**Tech Stack:** Next.js 16, Convex 1.31, React 19, Tailwind CSS 4, sonner (toasts), lucide-react

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `convex/schema.ts` | Modify | Add `waitlist` table with `email` + `joinedAt` + `by_email` index |
| `convex/waitlist.ts` | Create | `addToWaitlist` mutation — duplicate check + insert |
| `src/app/demo/page.tsx` | Modify | Client component with mobile detection logic |
| `src/app/(public)/_components/waiting-list.tsx` | Modify | Wire mutation, loading state, success/duplicate toasts |

---

## Task 1: Add `waitlist` table to Convex schema

**Files:**
- Modify: `convex/schema.ts`

- [ ] **Step 1: Add the waitlist table definition**

Open `convex/schema.ts`. The file currently ends after the `files` table. Add the `waitlist` table inside `defineSchema({...})`, after the `files` table:

```ts
  waitlist: defineTable({
    email: v.string(),
    joinedAt: v.number(),
  }).index("by_email", ["email"]),
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

  waitlist: defineTable({
    email: v.string(),
    joinedAt: v.number(),
  }).index("by_email", ["email"]),
});
```

- [ ] **Step 2: Verify Convex picks up the schema change**

Run the Convex dev server if not already running:
```bash
npx convex dev
```
Expected: No TypeScript errors, Convex dashboard shows the `waitlist` table.

- [ ] **Step 3: Commit**

```bash
git add convex/schema.ts
git commit -m "feat: add waitlist table to Convex schema"
```

---

## Task 2: Create the `addToWaitlist` Convex mutation

**Files:**
- Create: `convex/waitlist.ts`

- [ ] **Step 1: Create the mutation file**

Create `convex/waitlist.ts` with this exact content:

```ts
import { ConvexError, v } from "convex/values";
import { mutation } from "./_generated/server";

export const addToWaitlist = mutation({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const existing = await ctx.db
      .query("waitlist")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (existing) {
      throw new ConvexError("already_on_list");
    }

    await ctx.db.insert("waitlist", {
      email,
      joinedAt: Date.now(),
    });
  },
});
```

- [ ] **Step 2: Verify the mutation is generated**

The Convex dev server (from Task 1) will automatically pick up the new file and regenerate `convex/_generated/api.js` and `convex/_generated/api.d.ts`. Check the terminal for any TypeScript errors.

Expected: No errors. `api.waitlist.addToWaitlist` is now available.

- [ ] **Step 3: Commit**

```bash
git add convex/waitlist.ts
git commit -m "feat: add addToWaitlist Convex mutation with duplicate detection"
```

---

## Task 3: Wire up the waiting list form

**Files:**
- Modify: `src/app/(public)/_components/waiting-list.tsx`

- [ ] **Step 1: Replace the file with the wired-up version**

Replace the entire contents of `src/app/(public)/_components/waiting-list.tsx` with:

```tsx
"use client";

import { useState, useRef } from "react";
import { motion, useInView } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { ConvexError } from "convex/values";

export default function WaitingList() {
  const [email, setEmail] = useState("");
  const [isPending, setIsPending] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });

  const addToWaitlist = useMutation(api.waitlist.addToWaitlist);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    try {
      await addToWaitlist({ email });
      toast.success("You're on the list! We'll be in touch.");
      setEmail("");
    } catch (err) {
      if (err instanceof ConvexError && err.data === "already_on_list") {
        toast.info("You're already on the list!");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setIsPending(false);
    }
  };

  return (
    <section
      ref={ref}
      id="early-access"
      className="relative overflow-hidden px-6 py-24 sm:px-8 lg:px-12 bg-white"
    >
      {/* Dynamic Background */}
      <div className="absolute inset-0 -z-10 bg-slate-50/50 overflow-hidden">
        <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-indigo-100/50 blur-3xl opacity-60" />
        <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-blue-100/50 blur-3xl opacity-60" />
      </div>

      <div className="relative mx-auto max-w-2xl text-center">
        {/* Headline */}
        <motion.div
           initial={{ opacity: 0, y: 16 }}
           animate={inView ? { opacity: 1, y: 0 } : {}}
           transition={{ duration: 0.5 }}
        >
           <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-indigo-600">
             <Sparkles className="w-3 h-3" />
             Early Access
           </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Don&apos;t miss out, join the queue
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-lg text-slate-600">
              Get priority access to GadgetOS Web Demo, early features, and help
              shape the future of an AI-first operating system.
            </p>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="
            mx-auto mt-10 max-w-md rounded-2xl
            bg-white p-8
            shadow-xl shadow-indigo-100/50 ring-1 ring-slate-200/60
          "
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="group relative">
                <Input
                type="email"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isPending}
                className="h-12 w-full rounded-xl border-slate-200 bg-slate-50/50 px-4 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200 transition-all font-medium"
                />
            </div>

            <Button
              size="lg"
              disabled={isPending}
              className="
                h-12 w-full rounded-xl
                bg-indigo-600 text-white font-semibold
                hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-600/20
                transition-all duration-300
                disabled:opacity-60 disabled:cursor-not-allowed
              "
            >
              {isPending ? "Joining..." : "Join the waiting list"}
            </Button>
          </form>

          {/* Social proof */}
          <div className="mt-6 flex items-center justify-center gap-2 text-xs font-medium text-slate-500">
             <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-5 w-5 rounded-full border border-white bg-slate-200" />
                ))}
             </div>
             <p>Joined by 200+ developers</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify the import path for the generated API**

Check that the import `@/convex/_generated/api` resolves. Look at `tsconfig.json` to confirm `@/` maps to the project root (it should, since Next.js sets this up by default with `src/` as base URL or root).

If the `@/convex/` path doesn't resolve (check for red underlines in your editor or TypeScript errors), change the import to use a relative path:
```ts
import { api } from "../../../../convex/_generated/api";
```

- [ ] **Step 3: Run the dev server and manually test**

```bash
npm run dev
```

Open `http://localhost:3001` and scroll to the waiting list section.

Test cases:
1. Submit a new email → should see a green success toast "You're on the list! We'll be in touch." and the input clears.
2. Submit the same email again → should see a blue info toast "You're already on the list!" (not red).
3. While submitting, button should show "Joining..." and be disabled.

- [ ] **Step 4: Commit**

```bash
git add src/app/\(public\)/_components/waiting-list.tsx
git commit -m "feat: connect waiting list form to Convex with duplicate detection"
```

---

## Task 4: Mobile restriction on `/demo`

**Files:**
- Modify: `src/app/demo/page.tsx`

- [ ] **Step 1: Replace the demo page with a client component**

Replace the entire contents of `src/app/demo/page.tsx` with:

```tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DemoPage() {
  const router = useRouter();

  useEffect(() => {
    if (window.innerWidth > 768) {
      router.replace("/webos/lock-screen");
    }
  }, [router]);

  // On desktop the redirect fires immediately; this UI is only seen on mobile.
  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center px-6">
      <div className="max-w-md text-center space-y-6">
        <div className="flex justify-center">
          <div className="p-4 rounded-2xl bg-indigo-500/10 text-indigo-400">
            <Monitor className="w-12 h-12" />
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-2xl font-bold text-white">
            Desktop Only
          </h1>
          <p className="text-slate-400 leading-relaxed">
            GadgetOS Web Demo is designed for desktop browsers. Please visit
            on a laptop or desktop computer for the full experience.
          </p>
        </div>

        <Button
          asChild
          className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-full px-8"
        >
          <Link href="/">Back to Home</Link>
        </Button>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Manually test mobile behavior**

In Chrome DevTools, toggle device toolbar (Ctrl+Shift+M / Cmd+Shift+M) and open `http://localhost:3001/demo`.

Expected on mobile viewport (≤768px): The desktop-only page renders with the Monitor icon, message, and "Back to Home" button.

Expected on desktop viewport (>768px): Immediately redirects to `/webos/lock-screen` (no flash of the mobile UI).

- [ ] **Step 3: Commit**

```bash
git add src/app/demo/page.tsx
git commit -m "feat: restrict WebOS demo to desktop, show mobile-only page on small screens"
```

---

## Task 5: Final verification

- [ ] **Step 1: Run the build to catch any TypeScript errors**

```bash
npm run build
```

Expected: Build completes with no errors. Warnings about `dynamic` rendering for the demo page are acceptable.

- [ ] **Step 2: Run lint**

```bash
npm run lint
```

Expected: No errors.

- [ ] **Step 3: Full manual regression**

1. Landing page loads at `http://localhost:3001` — all sections visible.
2. Waiting list form: new email → success toast, same email → info toast (blue, not red).
3. Desktop: clicking "Launch Web Demo" → `/demo` → immediately redirected to `/webos/lock-screen`.
4. Mobile (DevTools): clicking "Launch Web Demo" → `/demo` → desktop-only page shown.
5. "Back to Home" button on mobile page → returns to `/`.
