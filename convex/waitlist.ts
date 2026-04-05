import { ConvexError, v } from "convex/values";
import { mutation } from "./_generated/server";

export const addToWaitlist = mutation({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const normalizedEmail = email.toLowerCase().trim();

    const existing = await ctx.db
      .query("waitlist")
      .withIndex("by_email", (q) => q.eq("email", normalizedEmail))
      .first();

    if (existing) {
      throw new ConvexError("already_on_list");
    }

    await ctx.db.insert("waitlist", {
      email: normalizedEmail,
      joinedAt: Date.now(),
    });
  },
});
