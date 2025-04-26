import { api } from "@/convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";

const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function getMetadata() {
  try {
    const settings = await client.query(api.settings.getSettings);
    return {
      title: settings?.store_name || "store",
      icons: settings?.mini_logo ? [{ url: settings.mini_logo }] : undefined,
    };
  } catch (error) {
    console.error("Error fetching metadata:", error);
    return {
      title: "store",
    };
  }
} 