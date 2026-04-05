import { v } from "convex/values";
import { action, internalQuery } from "./_generated/server";
import { getEmbeddingsWithAI } from "./openai";
import { internal } from "./_generated/api";
import { Doc, Id } from "./_generated/dataModel";

const USER_ID = process.env.CONVEX_USER_ID as Id<"users">;

export const fetchSearchResults = internalQuery({
  args: {
    results: v.array(v.object({ _id: v.id("files"), _score: v.float64() })),
  },
  handler: async (ctx, { results }) => {
    const docs = [];
    for (const r of results) {
      const doc = await ctx.db.get(r._id);
      if (doc) docs.push(doc);
    }
    return docs;
  },
});

export const searchFiles = action({
  args: { query: v.string() },
  handler: async (ctx, { query }): Promise<Doc<"files">[]> => {
    if (!query || query.length < 3) return [];
    try {
      const embedding = await getEmbeddingsWithAI(query);
      const results = await ctx.vectorSearch("files", "by_vector", {
        vector: embedding,
        limit: 5,
        filter: (q) => q.eq("userId", USER_ID),
      });
      return await ctx.runQuery(internal.search.fetchSearchResults, { results });
    } catch (err) {
      console.error("Vector search error:", err);
      return [];
    }
  },
});
