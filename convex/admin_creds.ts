// convex/admin_creds.ts
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// 1) Check if there is at least one document in admin_creds
export const adminCredsExist = query({
  args: {},
  returns: v.boolean(),
  handler: async (ctx) => {
    const docs = await ctx.db.query("admin_creds").take(1);
    return docs.length > 0;
  },
});

// 2) If no creds exist, create a default record
export const ensureDefaultAdminCreds = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const docs = await ctx.db.query("admin_creds").take(1);
    if (docs.length === 0) {
      await ctx.db.insert("admin_creds", {
        admin_username: "admin",
        admin_password: "admin",
      });
    }
    return null;
  },
});

// 3) Validate a username/password pair
export const loginAdmin = mutation({
  args: {
    username: v.string(),
    password: v.string(),
  },
  returns: v.boolean(),
  handler: async (ctx, { username, password }) => {
    const docs = await ctx.db.query("admin_creds").take(1);
    if (docs.length === 0) {
      return false;
    }
    const cred = docs[0];
    return (
      cred.admin_username === username && cred.admin_password === password
    );
  },
});