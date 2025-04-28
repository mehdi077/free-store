// convex/products.ts
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { PRODUCTS_PER_PAGE } from "./constants";

export const getAllCategories = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("categories"),
      _creationTime: v.number(),
      name_fr: v.string(),
      name_ar: v.string(),
    })
  ),
  handler: async (ctx) => {
    const categories = await ctx.db.query("categories").collect();
    return categories;
  },
});

export const getProductsByCategory = query({
  args: {
    categoryId: v.id("categories"),
    limit: v.number(),
  },
  returns: v.array(
    v.object({
      _id: v.id("products"),
      _creationTime: v.number(),
      name: v.string(),
      price: v.number(),
      promo_price: v.optional(v.number()),
      images: v.array(v.string()),
      description: v.optional(v.string()),
      description_images: v.optional(v.array(v.string())),
      real_images: v.optional(v.array(v.string())),
      product_id: v.string(),
      category: v.id("categories"),
    })
  ),
  handler: async (ctx, args) => {
    if (args.limit > 0) {
      const products = await ctx.db
        .query("products")
        .withIndex("by_category", (q) => q.eq("category", args.categoryId))
        .take(args.limit);
      return products;
    } else {
      const products = await ctx.db
        .query("products")
        .withIndex("by_category", (q) => q.eq("category", args.categoryId))
        .collect();
      return products;
    }
  },
});

export const getProductById = query({
  args: {
    productId: v.id("products"),
  },
  returns: v.object({
    _id: v.id("products"),
    _creationTime: v.number(),
    name: v.string(),
    price: v.number(),
    promo_price: v.optional(v.number()),
    images: v.array(v.string()),
    description: v.optional(v.string()),
    description_images: v.optional(v.array(v.string())),
    real_images: v.optional(v.array(v.string())),
    product_id: v.string(),
    category: v.id("categories"),
  }),
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.productId);
    if (!product) {
      throw new Error("Product not found");
    }
    return product;
  },
});

export const getCategoryById = query({
  args: {
    categoryId: v.id("categories"),
  },
  returns: v.object({
    _id: v.id("categories"),
    _creationTime: v.number(),
    name_fr: v.string(),
    name_ar: v.string(),
  }),
  handler: async (ctx, args) => {
    const category = await ctx.db.get(args.categoryId);
    if (!category) {
      throw new Error("Category not found");
    }
    return category;
  },
});

export const getProductCountByCategory = query({
  args: {
    categoryId: v.id("categories"),
  },
  returns: v.object({
    totalProducts: v.number(),
    totalPages: v.number(),
  }),
  handler: async (ctx, args) => {
    return ctx.db
      .query("products")
      .withIndex("by_category", (q) => q.eq("category", args.categoryId))
      .collect()
      .then((products) => {
        const totalProducts = products.length;
        const totalPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE);
        return {
          totalProducts,
          totalPages,
        };
      });
  },
});

export const getProductsByCategoryPaginated = query({
  args: {
    categoryId: v.id("categories"),
    page: v.number(),
  },
  returns: v.object({
    products: v.array(
      v.object({
        _id: v.id("products"),
        _creationTime: v.number(),
        name: v.string(),
        price: v.number(),
        promo_price: v.optional(v.number()),
        images: v.array(v.string()),
        description: v.optional(v.string()),
        description_images: v.optional(v.array(v.string())),
        real_images: v.optional(v.array(v.string())),
        product_id: v.string(),
        category: v.id("categories"),
      })
    ),
  }),
  handler: async (ctx, args) => {
    const skip = (args.page - 1) * PRODUCTS_PER_PAGE;
    const products = await ctx.db
      .query("products")
      .withIndex("by_category", (q) => q.eq("category", args.categoryId))
      .collect()
      .then((allProducts) => {
        const paginatedProducts = allProducts.slice(skip, skip + PRODUCTS_PER_PAGE);
        return { products: paginatedProducts };
      });
    return products;
  },
});

export const createOrder = mutation({
  args: {
    productId: v.id("products"),
    product_id: v.string(),
    quantity: v.number(),
    fullName: v.string(),
    phoneNumber: v.number(),
    selectedWilaya: v.string(),
    selectedDeliveryType: v.string(),
    deliveryAddress: v.optional(v.string()),
    exactAddress: v.optional(v.string()),
    orderRemarks: v.optional(v.string()),
    totalPrice: v.number(),
  },
  returns: v.object({
    _id: v.id("orders"),
    _creationTime: v.number(),
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
  handler: async (ctx, args) => {
    const orderId = await ctx.db.insert("orders", {
      product: args.productId,
      product_id: args.product_id,
      quantity: args.quantity,
      full_name: args.fullName,
      phone_number: args.phoneNumber,
      selected_wilaya: args.selectedWilaya,
      selected_delivery_type: args.selectedDeliveryType,
      delivery_address: args.deliveryAddress,
      exact_address: args.exactAddress,
      order_remarks: args.orderRemarks,
      total_price: args.totalPrice,
    });
    const order = await ctx.db.get(orderId);
    if (!order) throw new Error("Order not found");
    return order;
  },
});

export const getCategoryAndProductCount = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("categories"),
      name_fr: v.string(),
      name_ar: v.string(),
      productCount: v.number(),
    })
  ),
  handler: async (ctx) => {
    const categories = await ctx.db.query("categories").collect();
    const result = await Promise.all(
      categories.map(async (category) => {
        const productCount = await ctx.db
          .query("products")
          .withIndex("by_category", (q) => q.eq("category", category._id))
          .collect()
          .then((p) => p.length);
        return {
          _id: category._id,
          name_fr: category.name_fr,
          name_ar: category.name_ar,
          productCount,
        };
      })
    );
    return result;
  },
});

export const searchProducts = query({
  args: {
    searchQuery: v.string(),
  },
  returns: v.array(
    v.object({
      _id: v.id("products"),
      _creationTime: v.number(),
      name: v.string(),
      price: v.number(),
      promo_price: v.optional(v.number()),
      images: v.array(v.string()),
      description: v.optional(v.string()),
      description_images: v.optional(v.array(v.string())),
      real_images: v.optional(v.array(v.string())),
      product_id: v.string(),
      category: v.id("categories"),
    })
  ),
  handler: async (ctx, args) => {
    const products = await ctx.db.query("products").collect();
    const searchResults = products.filter((product) =>
      product.name.toLowerCase().includes(args.searchQuery.toLowerCase())
    );
    return searchResults;
  },
});

export const getTotalProductCount = query({
  args: {},
  returns: v.number(),
  handler: async (ctx) => {
    return ctx.db.query("products").collect().then((p) => p.length);
  },
});

export const createProduct = mutation({
  args: {
    name: v.string(),
    price: v.number(),
    promoPrice: v.optional(v.number()),
    images: v.array(v.string()),
    description: v.optional(v.string()),
    descriptionImages: v.optional(v.array(v.string())),
    realImages: v.optional(v.array(v.string())),
    productIdString: v.string(),
    categoryId: v.id("categories"),
  },
  returns: v.object({
    _id: v.id("products"),
    _creationTime: v.number(),
    name: v.string(),
    price: v.number(),
    promo_price: v.optional(v.number()),
    images: v.array(v.string()),
    description: v.optional(v.string()),
    description_images: v.optional(v.array(v.string())),
    real_images: v.optional(v.array(v.string())),
    product_id: v.string(),
    category: v.id("categories"),
  }),
  handler: async (ctx, args) => {
    const insertedId = await ctx.db.insert("products", {
      name: args.name,
      price: args.price,
      promo_price: args.promoPrice,
      images: args.images,
      description: args.description,
      description_images: args.descriptionImages,
      real_images: args.realImages,
      product_id: args.productIdString,
      category: args.categoryId,
    });
    const product = await ctx.db.get(insertedId);
    if (!product) throw new Error("Produit introuvable après insertion.");
    return product;
  },
});

export const deleteProduct = mutation({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.productId);
  },
});

export const updateProduct = mutation({
  args: {
    productId: v.id("products"),
    name: v.string(),
    price: v.number(),
    promoPrice: v.optional(v.number()),
    images: v.array(v.string()),
    description: v.optional(v.string()),
    descriptionImages: v.optional(v.array(v.string())),
    realImages: v.optional(v.array(v.string())),
    categoryId: v.id("categories"),
  },
  returns: v.object({
    _id: v.id("products"),
    _creationTime: v.number(),
    name: v.string(),
    price: v.number(),
    promo_price: v.optional(v.number()),
    images: v.array(v.string()),
    description: v.optional(v.string()),
    description_images: v.optional(v.array(v.string())),
    real_images: v.optional(v.array(v.string())),
    product_id: v.string(),
    category: v.id("categories"),
  }),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.productId, {
      name: args.name,
      price: args.price,
      promo_price: args.promoPrice,
      images: args.images,
      description: args.description,
      description_images: args.descriptionImages,
      real_images: args.realImages,
      category: args.categoryId,
    });
    const updated = await ctx.db.get(args.productId);
    if (!updated) throw new Error("Produit non trouvé après mise à jour");
    return updated;
  },
});