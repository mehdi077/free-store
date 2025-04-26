import { query } from "./_generated/server";
import { v } from "convex/values";

// Helper type for the order document combined with its product name and formatted date
export interface OrderWithExtras {
  _id: string;
  product_id: string;
  quantity: number;
  full_name: string;
  phone_number: number;
  selected_wilaya?: string;
  selected_delivery_type?: string;
  delivery_address?: string;
  exact_address?: string;
  order_remarks?: string;
  total_price: number;
  // Added extras
  product_name: string;
  product: string;
  created_at: string;
}

export const getOrders = query({
  // Unix epoch milliseconds boundaries
  args: {
    start: v.number(),
    end: v.number(),
  },
  handler: async (ctx, { start, end }): Promise<OrderWithExtras[]> => {
    // Fetch all orders inside the requested period, sorted by most recent
    const orders = await ctx.db
      .query("orders")
      .filter((q) => 
        q.and(
          q.gte(q.field("_creationTime"), start),
          q.lte(q.field("_creationTime"), end)
        )
      )
      .order("desc")
      .collect();

    // Collect the distinct product Id references so we can batch-fetch the product names
    const distinctProductIds = Array.from(new Set(orders.map((o) => o.product)));

    const products = await Promise.all(
      distinctProductIds.map(async (id) => {
        const p = await ctx.db.get(id);
        return p ? { id, name: p.name, product_id: p.product_id } : null;
      })
    );

    const productNameById = new Map<string, { name: string; product_id: string }>();
    for (const p of products) {
      if (p) productNameById.set(p.id as string, { name: p.name, product_id: p.product_id });
    }

    // Map orders to include extras required by the UI
    return orders.map((o) => {
      const productInfo = productNameById.get(o.product as string);
      return {
        ...o,
        product_name: productInfo?.name ?? "",
        product_id: productInfo?.product_id ?? o.product_id,
        product: o.product,
        created_at: new Date(o._creationTime).toLocaleDateString("fr-DZ"),
      } as OrderWithExtras;
    });
  },
});
