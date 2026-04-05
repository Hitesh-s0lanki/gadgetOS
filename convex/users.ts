import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createUser = mutation({
  args: { username: v.string(), password: v.string() },
  handler: async (ctx, { username, password }) => {
    return await ctx.db.insert("users", { username, password });
  },
});

export const getUserByUsername = query({
  args: { username: v.string() },
  handler: async (ctx, { username }) => {
    return await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", username))
      .first();
  },
});
