# Design: Mobile Restriction on Demo & Waitlist Email Persistence

**Date:** 2026-04-05  
**Branch:** features/wishlist  
**Status:** Approved

---

## Overview

Three connected improvements:
1. Block mobile users from accessing the WebOS demo — show a "desktop only" page instead.
2. Wire up the waiting list form to actually save emails to Convex.
3. Handle duplicate email submissions with a friendly, non-error-looking toast.

---

## Feature 1: Mobile Restriction on `/demo`

### Current Behavior
`src/app/demo/page.tsx` is a server component that unconditionally calls `redirect("/webos/lock-screen")`. Mobile users land in a desktop OS UI that is unusable on small screens.

### New Behavior
Convert `demo/page.tsx` to a `"use client"` component. On mount:
- If `window.innerWidth <= 768` → render a centered "desktop only" page with GadgetOS branding, a short explanation, and a "Back to Home" `<Link href="/">` button.
- If `window.innerWidth > 768` → call `router.replace("/webos/lock-screen")`.

### Constraints
- No flash/spinner — the redirect fires immediately after mount, before meaningful content renders.
- 768px breakpoint aligns with Tailwind's `md` breakpoint, consistent with the rest of the codebase.
- No middleware or User-Agent sniffing — viewport width is the correct signal for "can this screen run a desktop OS UI."

---

## Feature 2: Waitlist Email → Convex DB

### Schema Addition (`convex/schema.ts`)
Add a new `waitlist` table:
```ts
waitlist: defineTable({
  email: v.string(),
  joinedAt: v.number(),
}).index("by_email", ["email"])
```

### Convex Mutation (`convex/waitlist.ts`)
New file with a single `addToWaitlist` mutation:
- Accepts `{ email: string }`.
- Queries the `by_email` index for an existing record.
- If found: throws `new ConvexError("already_on_list")`.
- If not found: inserts `{ email, joinedAt: Date.now() }`.

### Form Updates (`src/app/(public)/_components/waiting-list.tsx`)
- Import `useMutation` from `convex/react` and `api` from `convex/_generated/api`.
- Add `isPending` boolean state; disable the submit button while the mutation is in flight.
- On success → `toast.success("You're on the list! We'll be in touch.")`.
- On `ConvexError("already_on_list")` → `toast.info("You're already on the list!")` — neutral blue styling, not red/destructive.
- Reset email input on success.

---

## Error Handling

| Scenario | Response |
|---|---|
| Valid new email | `toast.success` + input reset |
| Duplicate email | `toast.info` (neutral, not red) |
| Network/server error | `toast.error` (generic fallback) |

---

## Files Changed

| File | Change |
|---|---|
| `convex/schema.ts` | Add `waitlist` table |
| `convex/waitlist.ts` | New file — `addToWaitlist` mutation |
| `src/app/demo/page.tsx` | Convert to client component with mobile detection |
| `src/app/(public)/_components/waiting-list.tsx` | Wire up mutation, add toasts and loading state |

---

## Out of Scope

- Email confirmation / verification
- Unsubscribe flow
- Admin UI for viewing waitlist entries
- Analytics on signups
