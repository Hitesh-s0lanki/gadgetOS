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
});
