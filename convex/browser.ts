import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ── Bookmarks ────────────────────────────────────────────────────────────────

export const getBookmarks = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("bookmarks").collect();
  },
});

export const addBookmark = mutation({
  args: { url: v.string(), title: v.string() },
  handler: async (ctx, { url, title }) => {
    const existing = await ctx.db
      .query("bookmarks")
      .filter((q) => q.eq(q.field("url"), url))
      .first();
    if (existing) return existing._id;
    return await ctx.db.insert("bookmarks", { url, title });
  },
});

export const removeBookmark = mutation({
  args: { id: v.id("bookmarks") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});

// ── Browser History ──────────────────────────────────────────────────────────

export const getHistory = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("browserHistory")
      .order("desc")
      .take(50);
  },
});

export const addHistoryEntry = mutation({
  args: { url: v.string(), title: v.string() },
  handler: async (ctx, { url, title }) => {
    return await ctx.db.insert("browserHistory", {
      url,
      title,
      visitedAt: Date.now(),
    });
  },
});

export const clearHistory = mutation({
  args: {},
  handler: async (ctx) => {
    const entries = await ctx.db.query("browserHistory").collect();
    await Promise.all(entries.map((e) => ctx.db.delete(e._id)));
  },
});
