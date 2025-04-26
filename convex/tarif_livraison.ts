import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { api } from "./_generated/api";
import wilayaData from "./livrison.json";

// Query to check if any tarif_livraison documents exist
export const checkTarifLivraisonExists = query({
  args: {},
  returns: v.boolean(),
  handler: async (ctx) => {
    const firstDoc = await ctx.db
      .query("tarif_livraison")
      .first();
    return firstDoc !== null;
  },
});

// Mutation to import wilaya data from JSON
export const importWilayaData = mutation({
  args: {},
  handler: async (ctx) => {
    // Import only wilaya_code and wilaya_name for each entry
    for (const entry of wilayaData) {
      await ctx.db.insert("tarif_livraison", {
        wilaya_code: entry.wilaya_code.toString(),
        wilaya_name: entry.wilaya_name,
      });
    }
  },
});

// Internal query to get the JSON data
export const getWilayaJson = query({
  args: {},
  returns: v.array(v.object({
    wilaya_code: v.number(),
    wilaya_name: v.string(),
  })),
  handler: async () => {
    return wilayaData;
  },
});

// Query to get all tariff data
export const getAllTariffs = query({
  args: {},
  returns: v.array(v.object({
    _id: v.id("tarif_livraison"),
    _creationTime: v.number(),
    wilaya_code: v.optional(v.string()),
    wilaya_name: v.optional(v.string()),
    price: v.optional(v.string()),
    delivery_office_price: v.optional(v.string()),
    delivery_office_address: v.optional(v.string())
  })),
  handler: async (ctx) => {
    return await ctx.db.query("tarif_livraison").collect();
  },
});

// Query to get sorted tariffs for product page
export const getSortedTariffs = query({
  args: {},
  returns: v.array(v.object({
    _id: v.id("tarif_livraison"),
    _creationTime: v.number(),
    wilaya_code: v.optional(v.string()),
    wilaya_name: v.optional(v.string()),
    price: v.optional(v.string()),
    delivery_office_price: v.optional(v.string()),
    delivery_office_address: v.optional(v.string())
  })),
  handler: async (ctx) => {
    const allTariffs = await ctx.db
      .query("tarif_livraison")
      .collect();
    
    // Create a Map to store unique wilaya codes
    const uniqueTariffs = new Map();
    
    // Keep only the first occurrence of each wilaya_code
    allTariffs.forEach(tariff => {
      if (tariff.wilaya_code && tariff.wilaya_name && !uniqueTariffs.has(tariff.wilaya_code)) {
        uniqueTariffs.set(tariff.wilaya_code, tariff);
      }
    });
    
    // Convert Map values back to array and sort by wilaya code
    return Array.from(uniqueTariffs.values())
      .sort((a, b) => parseInt(a.wilaya_code!) - parseInt(b.wilaya_code!));
  },
});

// Mutation to update tariff prices and delivery info
export const updateTariff = mutation({
  args: {
    tariffId: v.id("tarif_livraison"),
    price: v.optional(v.string()),
    delivery_office_price: v.optional(v.string()),
    delivery_office_address: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.tariffId, {
      price: args.price,
      delivery_office_price: args.delivery_office_price,
      delivery_office_address: args.delivery_office_address
    });
  },
}); 