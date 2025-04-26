import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Query: Retrieve the single Settings document if it exists.
 */
export const getSettings = query({
  args: {},
  // No explicit returns validator to avoid type mismatch; runtime value can be undefined or object
  handler: async (ctx) => {
    // There should be at most one document. Grab the first, if any.
    return await ctx.db.query("settings").first();
  },
});

/**
 * Mutation: Create or update the Settings document.
 */
export const saveSettings = mutation({
  args: {
    // Optional id to update. If undefined, create.
    settingsId: v.optional(v.id("settings")),

    store_name: v.string(),
    big_logo: v.optional(v.string()),
    mini_logo: v.optional(v.string()),
    show_header: v.boolean(),
    phone_number: v.string(),
    fb_pixel_id: v.optional(v.string()),
  },
  returns: v.id("settings"),
  handler: async (ctx, args) => {
    const { settingsId, ...rest } = args;
    if (settingsId) {
      await ctx.db.patch(settingsId, rest);
      return settingsId;
    }
    return await ctx.db.insert("settings", rest);
  },
});
