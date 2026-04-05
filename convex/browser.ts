import { Id } from "./_generated/dataModel";
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

const USER_ID = process.env.CONVEX_USER_ID as Id<"users">;

// ── Bookmarks ────────────────────────────────────────────────────────────────

export const getBookmarks = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("bookmarks")
      .withIndex("by_user", (q) => q.eq("userId", USER_ID))
      .collect();
  },
});

export const addBookmark = mutation({
  args: { url: v.string(), title: v.string() },
  handler: async (ctx, { url, title }) => {
    const existing = await ctx.db
      .query("bookmarks")
      .withIndex("by_user", (q) => q.eq("userId", USER_ID))
      .filter((q) => q.eq(q.field("url"), url))
      .first();
    if (existing) return existing._id;
    return await ctx.db.insert("bookmarks", { userId: USER_ID, url, title });
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
      .withIndex("by_user", (q) => q.eq("userId", USER_ID))
      .order("desc")
      .take(50);
  },
});

export const addHistoryEntry = mutation({
  args: { url: v.string(), title: v.string() },
  handler: async (ctx, { url, title }) => {
    return await ctx.db.insert("browserHistory", {
      userId: USER_ID,
      url,
      title,
      visitedAt: Date.now(),
    });
  },
});

export const clearHistory = mutation({
  args: {},
  handler: async (ctx) => {
    const entries = await ctx.db
      .query("browserHistory")
      .withIndex("by_user", (q) => q.eq("userId", USER_ID))
      .collect();
    await Promise.all(entries.map((e) => ctx.db.delete(e._id)));
  },
});
