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
      .filter((q) =>
        q.and(
          q.eq(q.field("parentId"), undefined),
          q.eq(q.field("deletedAt"), undefined)
        )
      )
      .collect();
  },
});

export const getFolders = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("folders")
      .withIndex("by_user", (q) => q.eq("userId", USER_ID))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .collect();
  },
});

export const getFoldersByParent = query({
  args: { parentId: v.id("folders") },
  handler: async (ctx, { parentId }) => {
    return await ctx.db
      .query("folders")
      .withIndex("by_user", (q) => q.eq("userId", USER_ID))
      .filter((q) =>
        q.and(
          q.eq(q.field("parentId"), parentId),
          q.eq(q.field("deletedAt"), undefined)
        )
      )
      .collect();
  },
});

export const getFolderBreadcrumb = query({
  args: { folderId: v.id("folders") },
  handler: async (ctx, { folderId }) => {
    const crumbs: { _id: Id<"folders">; name: string }[] = [];
    let current = await ctx.db.get(folderId);
    while (current) {
      if (current.userId !== USER_ID || current.deletedAt !== undefined) break;
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
    const results = await ctx.db
      .query("folders")
      .withIndex("by_user", (q) => q.eq("userId", USER_ID))
      .filter((q) => q.eq(q.field("name"), name))
      .collect();
    return results.filter((f) => f.deletedAt === undefined);
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

export const renameFolder = mutation({
  args: { folderId: v.id("folders"), newName: v.string() },
  handler: async (ctx, { folderId, newName }) => {
    if (!newName.trim()) return;
    const folder = await ctx.db.get(folderId);
    if (!folder || folder.userId !== USER_ID) return;
    await ctx.db.patch(folderId, { name: newName });
  },
});

export const softDeleteFolder = mutation({
  args: { folderId: v.id("folders") },
  handler: async (ctx, { folderId }) => {
    const now = Date.now();

    // BFS: collect this folder + all descendants
    const queue: Id<"folders">[] = [folderId];
    const allFolderIds: Id<"folders">[] = [];

    while (queue.length > 0) {
      const current = queue.shift()!;
      allFolderIds.push(current);
      const children = await ctx.db
        .query("folders")
        .withIndex("by_user", (q) => q.eq("userId", USER_ID))
        .filter((q) => q.eq(q.field("parentId"), current))
        .collect();
      for (const child of children) {
        queue.push(child._id);
      }
    }

    // Soft-delete all folders
    for (const id of allFolderIds) {
      await ctx.db.patch(id, { deletedAt: now });
    }

    // Soft-delete all files in those folders
    for (const id of allFolderIds) {
      const files = await ctx.db
        .query("files")
        .withIndex("by_folder", (q) => q.eq("folderId", id))
        .collect();
      for (const file of files) {
        await ctx.db.patch(file._id, { deletedAt: now });
      }
    }
  },
});
