import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
    ...authTables,
    admin_creds: defineTable({
      admin_username: v.optional(v.string()),
      admin_password: v.optional(v.string()),
    }),

    tarif_livraison: defineTable({
      wilaya_code: v.optional(v.string()),
      wilaya_name: v.optional(v.string()),
      price: v.optional(v.string()),
      delivery_office_price: v.optional(v.string()),
      delivery_office_address: v.optional(v.string())
    }),

    settings: defineTable({
      store_name: v.optional(v.string()),
      big_logo: v.optional(v.string()),
      mini_logo: v.optional(v.string()),
      show_header: v.optional(v.boolean()),
      phone_number: v.optional(v.string()),
      fb_pixel_id: v.optional(v.string()),
    }),

    categories: defineTable({
      name_fr: v.string(),
      name_ar: v.string(),
    }),

    products: defineTable({
      name: v.string(),
      price: v.number(),
      images: v.array(v.string()),
      description: v.optional(v.string()),
      description_images: v.optional(v.array(v.string())),
      real_images: v.optional(v.array(v.string())),
      product_id: v.string(),
      category: v.id("categories"),
      promo_price: v.optional(v.number()),
    }).index("by_category", ["category"]),

    orders: defineTable({
      product: v.id("products"),
      product_id: v.string(),
      quantity: v.number(),
      full_name: v.string(),
      phone_number: v.number(),
      selected_wilaya: v.string(),
      selected_delivery_type: v.string(),
      delivery_address: v.optional(v.string()),
      exact_address: v.optional(v.string()),
      order_remarks: v.optional(v.string()),
      total_price: v.number(),
    }),

})