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
