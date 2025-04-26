import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const addCategory = mutation({
  args: {
    name_fr: v.string(),
    name_ar: v.string(),
  },
  handler: async (ctx, args) => {
    const categoryId = await ctx.db.insert("categories", {
      name_fr: args.name_fr,
      name_ar: args.name_ar,
    });
    return categoryId;
  },
});

export const removeCategory = mutation({
  args: {
    categoryId: v.id("categories"),
  },
  handler: async (ctx, args) => {
    // First delete all products in this category
    const productsToDelete = await ctx.db
      .query("products")
      .withIndex("by_category", (q) => q.eq("category", args.categoryId))
      .collect();
    
    for (const product of productsToDelete) {
      await ctx.db.delete(product._id);
    }

    // Then delete the category
    await ctx.db.delete(args.categoryId);
    return true;
  },
});