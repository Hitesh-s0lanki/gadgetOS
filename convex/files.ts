import { Id } from "./_generated/dataModel";
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

const USER_ID = process.env.CONVEX_USER_ID as Id<"users">;

export const getFilesByFolder = query({
  args: { folderId: v.id("folders") },
  handler: async (ctx, { folderId }) => {
    return await ctx.db
      .query("files")
      .withIndex("by_folder", (q) => q.eq("folderId", folderId))
      .filter((q) =>
        q.and(
          q.eq(q.field("userId"), USER_ID),
          q.eq(q.field("deletedAt"), undefined)
        )
      )
      .collect();
  },
});

export const createFile = mutation({
  args: {
    folderId: v.id("folders"),
    name: v.string(),
    contentUrl: v.string(),
    type: v.string(),
    size: v.string(),
    description: v.optional(v.string()),
    content: v.optional(v.string()),
    vector: v.optional(v.array(v.float64())),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("files", { userId: USER_ID, ...args });
  },
});

export const createTextFile = mutation({
  args: {
    folderId: v.id("folders"),
    name: v.string(),
    type: v.string(),
    size: v.string(),
    content: v.string(),
    contentUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("files", {
      userId: USER_ID,
      contentUrl: "",
      ...args,
    });
  },
});

export const searchFiles = query({
  args: { searchTerm: v.string() },
  handler: async (ctx, { searchTerm }) => {
    const results = await ctx.db
      .query("files")
      .withSearchIndex("search_files", (q) =>
        q.search("name", searchTerm).eq("userId", USER_ID)
      )
      .collect();
    return results.filter((f) => f.deletedAt === undefined);
  },
});

export const getFileById = query({
  args: { fileId: v.id("files") },
  handler: async (ctx, { fileId }) => {
    const file = await ctx.db.get(fileId);
    if (!file || file.userId !== USER_ID || file.deletedAt !== undefined) return null;
    return file;
  },
});

export const deleteFile = mutation({
  args: { fileId: v.id("files") },
  handler: async (ctx, { fileId }) => {
    return await ctx.db.delete(fileId);
  },
});

export const renameFile = mutation({
  args: { fileId: v.id("files"), newName: v.string() },
  handler: async (ctx, { fileId, newName }) => {
    if (!newName.trim()) return;
    const file = await ctx.db.get(fileId);
    if (!file || file.userId !== USER_ID) return;
    await ctx.db.patch(fileId, { name: newName });
  },
});

export const softDeleteFile = mutation({
  args: { fileId: v.id("files") },
  handler: async (ctx, { fileId }) => {
    const file = await ctx.db.get(fileId);
    if (!file || file.userId !== USER_ID) return;
    await ctx.db.patch(fileId, { deletedAt: Date.now() });
  },
});
