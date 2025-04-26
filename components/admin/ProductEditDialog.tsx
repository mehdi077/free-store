/*
  ProductEditDialog.tsx
  A dialog component that allows admins to edit an existing product. It re-uses much of the logic from `ProductCreateDialog` but pre-fills inputs with the current
  product data retrieved from Convex using `getProductById`. The component supports updating:
  • name
  • price
  • description (rich-text)
  • category
  • images / description_images / real_images – Existing images are displayed with an ✕ button to remove; extra images can be uploaded.

  On submit, new images are uploaded to storage then an `updateProduct` mutation is called with the merged list of image URLs and any changed fields.
*/
"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Pencil } from "lucide-react";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { Upload, AlertCircle } from "lucide-react";

interface Props {
  productId: Id<"products">;
  onUpdated?: () => void;
}

export default function ProductEditDialog({ productId, onUpdated }: Props) {
  const product = useQuery(api.products.getProductById, { productId });
  const categories = useQuery(api.products.getAllCategories);

  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);
  const getUrl = useMutation(api.storage.getUrl);
  const updateProduct = useMutation(api.products.updateProduct);

  // Local state for form fields
  const [open, setOpen] = useState(false);
  const [categoryId, setCategoryId] = useState<Id<"categories"> | null>(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState(0);
  const [description, setDescription] = useState("");

  // Existing image URLs
  const [images, setImages] = useState<string[]>([]);
  const [descriptionImages, setDescriptionImages] = useState<string[]>([]);

  // New files chosen by user (to upload)
  const [newImages, setNewImages] = useState<File[]>([]);
  const [newDescriptionImages, setNewDescriptionImages] = useState<File[]>([]);
  
  // Preview URLs for new images
  const [newImagePreviewUrls, setNewImagePreviewUrls] = useState<string[]>([]);
  const [newDescriptionImagePreviewUrls, setNewDescriptionImagePreviewUrls] = useState<string[]>([]);

  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOptionalFields, setShowOptionalFields] = useState(false);

  /* initialise form when product fetched */
  useEffect(() => {
    if (!product) return;
    setCategoryId(product.category as Id<"categories">);
    setName(product.name);
    setPrice(product.price);
    setDescription(product.description ?? "");
    setImages(product.images);
    setDescriptionImages(product.description_images || []);
  }, [product]);

  const validateImageRatio = async (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const ratio = img.width / img.height;
        resolve(Math.abs(ratio - 1) < 0.1);
      };
      img.src = URL.createObjectURL(file);
    });
  };

  /* Handlers for new images */
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imgs = files.filter((f) => f.type.startsWith("image/"));
    
    const validImages: File[] = [];
    const newPreviewUrls: string[] = [];
    
    for (const img of imgs) {
      const isValidRatio = await validateImageRatio(img);
      if (isValidRatio) {
        validImages.push(img);
        newPreviewUrls.push(URL.createObjectURL(img));
      }
    }

    if (validImages.length < imgs.length) {
      setErrors(prev => ({
        ...prev,
        images: "Certaines images ont été ignorées. Toutes les images doivent avoir un ratio 1:1."
      }));
    } else {
      setErrors(prev => ({ ...prev, images: "" }));
    }

    setNewImages(prev => [...prev, ...validImages]);
    setNewImagePreviewUrls(prev => [...prev, ...newPreviewUrls]);
  };

  const handleDescriptionImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imgs = files.filter((f) => f.type.startsWith("image/"));
    
    const newPreviewUrls = imgs.map(img => URL.createObjectURL(img));
    
    setNewDescriptionImages(prev => [...prev, ...imgs]);
    setNewDescriptionImagePreviewUrls(prev => [...prev, ...newPreviewUrls]);
  };

  const removeExistingUrl = (
    url: string,
    listSetter: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    listSetter((prev) => prev.filter((u) => u !== url));
  };

  const handleSubmit = async () => {
    const newErr: { [k: string]: string } = {};
    if (!categoryId) newErr.category = "Catégorie requise";
    if (name.trim() === "") newErr.name = "Nom requis";
    if (price <= 0) newErr.price = "Prix invalide";
    setErrors(newErr);
    if (Object.keys(newErr).length) return;

    try {
      setIsSubmitting(true);
      // Upload new files sequentially
      let newImgUrls: string[] = [];
      let newDescUrls: string[] = [];

      // Upload main images
      for (const file of newImages) {
        const uploadUrl = await generateUploadUrl();
        const res = await fetch(uploadUrl, {
          method: "POST",
          body: file,
          headers: { "Content-Type": file.type },
        });
        if (!res.ok) throw new Error("Échec du téléchargement de l'image");
        const { storageId } = await res.json();
        const url = await getUrl({ storageId });
        if (url) newImgUrls.push(url);
      }

      // Upload description images if there are any
      if (newDescriptionImages.length > 0) {
        for (const file of newDescriptionImages) {
          const uploadUrl = await generateUploadUrl();
          const res = await fetch(uploadUrl, {
            method: "POST",
            body: file,
            headers: { "Content-Type": file.type },
          });
          if (!res.ok) throw new Error("Échec de l'upload d'image de description");
          const { storageId } = await res.json();
          
          const url = await getUrl({ storageId });
          if (url) newDescUrls.push(url);
        }
      }

      if (!categoryId) {
        throw new Error("Category ID is required");
      }
      
      await updateProduct({
        productId,
        name,
        price,
        categoryId,
        images: [...images, ...newImgUrls],
        description,
        descriptionImages: [...descriptionImages, ...newDescUrls],
      });

      if (onUpdated) onUpdated();
      setOpen(false);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="p-2 text-gray-500 hover:text-gray-700">
          <Pencil className="w-5 h-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto max-w-3xl w-full">
        <DialogHeader>
          <DialogTitle>Modifier le produit</DialogTitle>
        </DialogHeader>

        {!product ? (
          <p className="text-center p-8">Chargement…</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            {/* Category */}
            <div className="md:col-span-2 space-y-2">
              <Label>Catégorie</Label>
              <select
                className="border rounded px-3 py-2 w-full"
                value={categoryId ?? ""}
                onChange={(e) => setCategoryId(e.target.value as Id<"categories">)}
              >
                <option value="" disabled>
                  Sélectionner
                </option>
                {categories?.map((c) => (
                  <option key={c._id.toString()} value={c._id.toString()}>
                    {c.name_fr} - {c.name_ar}
                  </option>
                ))}
              </select>
              {errors.category && <p className="text-sm text-red-500">{errors.category}</p>}
            </div>

            {/* Name */}
            <div className="md:col-span-2 space-y-2">
              <Label>Nom</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
              {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
            </div>

            {/* Price */}
            <div className="space-y-2">
              <Label>Prix (DZD)</Label>
              <Input
                type="number"
                value={price}
                onChange={(e) => setPrice(parseInt(e.target.value || "0", 10))}
              />
              {errors.price && <p className="text-sm text-red-500">{errors.price}</p>}
            </div>

            {/* Description */}
            <div className="md:col-span-2 space-y-2">
              <Label>Description</Label>
              <RichTextEditor value={description || ""} onChange={setDescription} />
            </div>

            {/* Images section */}
            <div className="md:col-span-2 space-y-2">
              <Label className="flex items-center gap-1">
                Images principales
                {errors.images && (
                  <span className="text-red-500 text-sm flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" /> {errors.images}
                  </span>
                )}
              </Label>
              <div className="flex flex-wrap gap-2">
                {images.map((url) => (
                  <div key={url} className="relative group">
                    <img src={url} className="w-24 h-24 object-cover rounded border" />
                    <button
                      onClick={() => removeExistingUrl(url, setImages)}
                      className="absolute top-0 right-0 bg-black/60 text-white text-xs px-1 opacity-0 group-hover:opacity-100"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                {newImagePreviewUrls.map((url, idx) => (
                  <div key={`new-${idx}`} className="relative group">
                    <img src={url} alt="preview" className="w-24 h-24 object-cover rounded border" />
                    <button
                      onClick={() => {
                        // Remove from preview and files
                        setNewImagePreviewUrls(prev => prev.filter((_, i) => i !== idx));
                        setNewImages(prev => prev.filter((_, i) => i !== idx));
                      }}
                      className="absolute top-0 right-0 bg-black/60 text-white text-xs px-1 opacity-0 group-hover:opacity-100"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              <Button
                variant="outline"
                className={cn(
                  "w-full h-32 flex flex-col items-center justify-center gap-2 border-dashed",
                  errors.images ? "border-red-500" : "border-gray-300"
                )}
                onClick={() => document.getElementById(`new-images-${productId}`)?.click()}
              >
                <Upload className="w-8 h-8 text-gray-400" />
                <span className="text-sm text-gray-600">Ajouter des images</span>
              </Button>
              <input
                id={`new-images-${productId}`}
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>

            {/* Optional toggle */}
            <div className="md:col-span-2 flex items-center gap-2 py-2 border-t pt-4">
              <Switch checked={showOptionalFields} onCheckedChange={setShowOptionalFields} />
              <span>Landing Page mode</span>
            </div>

            {showOptionalFields && (
              <>
                {/* description images */}
                <div className="md:col-span-2 space-y-2">
                  <Label>Images de description</Label>
                  <div className="flex flex-wrap gap-2">
                    {descriptionImages.map((url) => (
                      <div key={url} className="relative group">
                        <img src={url} className="w-24 h-24 object-cover rounded border" />
                        <button
                          onClick={() => removeExistingUrl(url, setDescriptionImages)}
                          className="absolute top-0 right-0 bg-black/60 text-white text-xs px-1 opacity-0 group-hover:opacity-100"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    {newDescriptionImagePreviewUrls.map((url, idx) => (
                      <div key={`new-desc-${idx}`} className="relative group">
                        <img src={url} alt="preview" className="w-24 h-24 object-cover rounded border" />
                        <button
                          onClick={() => {
                            setNewDescriptionImagePreviewUrls(prev => prev.filter((_, i) => i !== idx));
                            setNewDescriptionImages(prev => prev.filter((_, i) => i !== idx));
                          }}
                          className="absolute top-0 right-0 bg-black/60 text-white text-xs px-1 opacity-0 group-hover:opacity-100"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full h-32 flex flex-col items-center justify-center gap-2 border-dashed",
                      errors.descriptionImages ? "border-red-500" : "border-gray-300"
                    )}
                    onClick={() => document.getElementById(`new-desc-${productId}`)?.click()}
                  >
                    <Upload className="w-8 h-8 text-gray-400" />
                    <span className="text-sm text-gray-600">Ajouter images description</span>
                  </Button>
                  <input
                    id={`new-desc-${productId}`}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleDescriptionImageChange}
                    className="hidden"
                  />
                </div>
              </>
            )}
          </div>
        )}

        <DialogFooter className="pt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Mise à jour…" : "Mettre à jour"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
