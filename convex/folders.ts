import { Id } from "./_generated/dataModel";
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Hardcoded user — set via: npx convex env set CONVEX_USER_ID <id>
const USER_ID = process.env.CONVEX_USER_ID as Id<"users">;

export const getRootFolders = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("folders")
      .withIndex("by_user", (q) => q.eq("userId", USER_ID))
      .filter((q) => q.eq(q.field("parentId"), undefined))
      .collect();
  },
});

export const getFolders = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("folders")
      .withIndex("by_user", (q) => q.eq("userId", USER_ID))
      .collect();
  },
});

export const getFoldersByParent = query({
  args: { parentId: v.id("folders") },
  handler: async (ctx, { parentId }) => {
    return await ctx.db
      .query("folders")
      .withIndex("by_user", (q) => q.eq("userId", USER_ID))
      .filter((q) => q.eq(q.field("parentId"), parentId))
      .collect();
  },
});

export const getFolderBreadcrumb = query({
  args: { folderId: v.id("folders") },
  handler: async (ctx, { folderId }) => {
    const crumbs: { _id: Id<"folders">; name: string }[] = [];
    let current = await ctx.db.get(folderId);
    while (current) {
      if (current.userId !== USER_ID) break;
      crumbs.unshift({ _id: current._id, name: current.name });
      if (!current.parentId) break;
      current = await ctx.db.get(current.parentId);
    }
    return crumbs;
  },
});

export const searchFoldersByName = query({
  args: { name: v.string() },
  handler: async (ctx, { name }) => {
    return await ctx.db
      .query("folders")
      .withIndex("by_user", (q) => q.eq("userId", USER_ID))
      .filter((q) => q.eq(q.field("name"), name))
      .collect();
  },
});

export const createFolder = mutation({
  args: {
    name: v.string(),
    parentId: v.optional(v.id("folders")),
  },
  handler: async (ctx, { name, parentId }) => {
    return await ctx.db.insert("folders", { userId: USER_ID, name, parentId });
  },
});
