import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Simple wrapper to generate a signed upload URL clients can POST files to.
export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

export const getUrl = mutation({
  args: { storageId: v.string() },
  handler: async (ctx, { storageId }) => {
    return await ctx.storage.getUrl(storageId);
  },
});

export const getImageUrls = query({
  args: { storageIds: v.array(v.string()) },
  handler: async (ctx, { storageIds }) => {
    const urls = await Promise.all(
      storageIds.map(async (storageId) => {
        return await ctx.storage.getUrl(storageId);
      })
    );
    return urls;
  },
});

export const getAllStorageImages = query({
  args: {
    page: v.number(),
  },
  returns: v.object({
    images: v.array(v.object({
      url: v.string(),
      storageId: v.string()
    }))
  }),
  handler: async (ctx, { page }) => {
    const STORAGE_PER_PAGE = 20;
    const skip = (page - 1) * STORAGE_PER_PAGE;

    const paginatedStorageDocs = await ctx.db.system.query("_storage")
      .order("desc")
      .collect()
      .then((allStorageDocs) => allStorageDocs.slice(skip, skip + STORAGE_PER_PAGE));
    
    const imagePromises = paginatedStorageDocs.map(async (doc) => {
      try {
        const url = await ctx.storage.getUrl(doc._id);
        return {
          url,
          storageId: doc._id
        };
      } catch (e) {
        console.error(`Error getting URL for ${doc._id}:`, e);
        return null;
      }
    });
    
    const allImages = await Promise.all(imagePromises);
    
    return {
      images: allImages.filter(Boolean) as { url: string; storageId: string }[]
    };
  },
});

export const deleteStorageImage = mutation({
  args: { storageId: v.string() },
  handler: async (ctx, { storageId }) => {
    // Find the storage document to verify it exists
    const storageDoc = await ctx.db.system.query("_storage")
      .filter(q => q.eq(q.field("_id"), storageId))
      .first();

    if (!storageDoc) {
      throw new Error("Storage document not found");
    }

    // Delete the file - Convex will automatically clean up the storage document
    await ctx.storage.delete(storageId);

    return true;
  },
});
