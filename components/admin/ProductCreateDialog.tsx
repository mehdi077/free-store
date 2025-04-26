"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useRouter } from "next/navigation";
import { PlusCircle } from "lucide-react";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Switch } from "@/components/ui/switch";
import { ChevronDown, ChevronUp, Upload, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  onCreated?: () => void; // optional callback after product created
}

export default function ProductCreateDialog({ onCreated }: Props) {
  const router = useRouter();
  const categories = useQuery(api.products.getAllCategories);
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);
  const createProduct = useMutation(api.products.createProduct);
  const getUrl = useMutation(api.storage.getUrl);

  const [open, setOpen] = useState(false);
  const [categoryId, setCategoryId] = useState<Id<"categories"> | "add" | null>(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState(0);
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  
  // Check if all required fields are filled
  const isFormValid = name.trim() !== "" && price > 0 && images.length > 0 && categoryId && categoryId !== "add";
  
  // State for optional fields toggle
  const [showOptionalFields, setShowOptionalFields] = useState(false);
  
  // States for optional fields
  const [descriptionImages, setDescriptionImages] = useState<File[]>([]);
  const [descriptionImagePreviewUrls, setDescriptionImagePreviewUrls] = useState<string[]>([]);

  const validateImageRatio = async (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const ratio = img.width / img.height;
        resolve(Math.abs(ratio - 1) < 0.1); // Allow small deviation from perfect 1:1
      };
      img.src = URL.createObjectURL(file);
    });
  };

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

    setImages(prev => [...prev, ...validImages]);
    setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
  };

  const handleDescriptionImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imgs = files.filter((f) => f.type.startsWith("image/"));
    
    const newPreviewUrls = imgs.map(img => URL.createObjectURL(img));
    
    setDescriptionImages(prev => [...prev, ...imgs]);
    setDescriptionImagePreviewUrls(prev => [...prev, ...newPreviewUrls]);
    setErrors(prev => ({ ...prev, descriptionImages: "" }));
  };

  const resetForm = () => {
    setCategoryId(null);
    setName("");
    setPrice(0);
    setDescription("");
    setImages([]);
    setPreviewUrls([]);
    
    // Reset optional fields
    setShowOptionalFields(false);
    setDescriptionImages([]);
    setDescriptionImagePreviewUrls([]);
  };

  const handleSubmit = async () => {
    const newErrors: { [key: string]: string } = {};
    if (!categoryId || categoryId === "add") newErrors.category = "Veuillez sélectionner une catégorie";
    if (name.trim() === "") newErrors.name = "Le nom est requis";
    if (price <= 0) newErrors.price = "Le prix doit être supérieur à 0";
    if (images.length === 0) newErrors.images = "Au moins une image du produit est requise";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      return;
    }
    try {
      setIsSubmitting(true);
      // upload images sequentially
      const storageIds: string[] = [];

      for (const file of images) {
        const uploadUrl = await generateUploadUrl();
        const res = await fetch(uploadUrl, {
          method: "POST",
          body: file,
          headers: { "Content-Type": file.type },
        });
        if (!res.ok) throw new Error("Échec du téléchargement de l'image");
        const { storageId } = await res.json();
        storageIds.push(storageId);
      }

      // Get image URLs one by one
      const imageUrls: string[] = [];
      for (const storageId of storageIds) {
        const url = await getUrl({ storageId });
        if (url) imageUrls.push(url);
      }
      
      if (imageUrls.length === 0) throw new Error("Aucune URL d'image valide n'a été récupérée");

      // Upload description images if there are any
      const descriptionImageUrls: string[] = [];
      if (descriptionImages.length > 0) {
        for (const file of descriptionImages) {
          const uploadUrl = await generateUploadUrl();
          const res = await fetch(uploadUrl, {
            method: "POST",
            body: file,
            headers: { "Content-Type": file.type },
          });
          if (!res.ok) throw new Error("Échec de l'upload d'image de description");
          const { storageId } = await res.json();
          
          const url = await getUrl({ storageId });
          if (url) descriptionImageUrls.push(url);
        }
      }

      await createProduct({
        name,
        price,
        images: imageUrls, // Pass URLs instead of storage IDs
        description,
        descriptionImages: descriptionImageUrls.length > 0 ? descriptionImageUrls : undefined,
        productIdString: Date.now().toString(), // simple id string
        categoryId: categoryId as Id<"categories">,
      });
      if (onCreated) onCreated();
      setOpen(false);
      resetForm();
    } catch (err) {
      console.error(err);
      // TODO: toast error
    } finally {
      setIsSubmitting(false);
    }
  };

  const categorySelected = categoryId && categoryId !== "add";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default"><PlusCircle className="w-4 h-4 mr-1" /> Ajouter un produit</Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Créer un nouveau produit</DialogTitle>
          <DialogDescription>Remplissez les informations du produit puis cliquez sur « Créer ».</DialogDescription>
        </DialogHeader>

        {/* Sélecteur de catégorie */}
        <div className="space-y-2">
          <Label className="flex items-center gap-1">
                Catégorie <span className="text-red-500">*</span>
                {errors.category && (
                  <span className="text-red-500 text-sm flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" /> {errors.category}
                  </span>
                )}
              </Label>
          <select
            className="w-full border rounded px-3 py-2"
            value={categoryId ?? ""}
            onChange={(e) => {
              const val = e.target.value;
              if (val === "add") {
                router.push("/admin/categories");
                return;
              }
              setCategoryId(val as Id<"categories">);
            }}
          >
            <option value="" disabled>
              Sélectionnez une catégorie…
            </option>
            {categories?.map((c) => (
              <option key={c._id} value={c._id as unknown as string}>
                {c.name_fr} - {c.name_ar}
              </option>
            ))}
            <option value="add">➕ Ajouter une catégorie</option>
          </select>
        </div>

        {/* Champs supplémentaires */}
        {categorySelected && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                Nom du produit <span className="text-red-500">*</span>
                {errors.name && (
                  <span className="text-red-500 text-sm flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" /> {errors.name}
                  </span>
                )}
              </Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nom du produit" />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                Prix <span className="text-red-500">*</span>
                {errors.price && (
                  <span className="text-red-500 text-sm flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" /> {errors.price}
                  </span>
                )}
              </Label>
              <div className="relative">
                <Input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(parseInt(e.target.value || "0", 10))}
                  className="pr-8"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 opacity-50 pointer-events-none">
                  DA
                </span>
              </div>
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label>Description (optionnel)</Label>
              <RichTextEditor 
                value={description}
                onChange={setDescription}
                placeholder="Description du produit..."
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label className="flex items-center gap-1">
                Images du produit <span className="text-red-500">*</span>
                {errors.images && (
                  <span className="text-red-500 text-sm flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" /> {errors.images}
                  </span>
                )}
              </Label>
              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  className={cn(
                    "w-full h-32 flex flex-col items-center justify-center gap-2 border-dashed",
                    errors.images ? "border-red-500" : "border-gray-300"
                  )}
                  onClick={() => document.getElementById("product-images")?.click()}
                >
                  <Upload className="w-8 h-8 text-gray-400" />
                  <span className="text-sm text-gray-600">Cliquez pour télécharger des images du produit en utilisation réelle <span className="font-bold text-red-500">(ratio 1:1 requis)</span></span>
                </Button>
                <input
                  id="product-images"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
              {/* previews */}
              {previewUrls.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {previewUrls.map((url, idx) => (
                    <img key={idx} src={url} alt="preview" className="w-24 h-24 object-cover rounded border" />
                  ))}
                </div>
              )}
            </div>

            {/* Toggle for optional fields */}
            <div className="md:col-span-2 pt-4 border-t mt-4">
              <div 
                className="flex items-center justify-between cursor-pointer" 
                onClick={() => setShowOptionalFields(!showOptionalFields)}
              >
                <div className="flex items-center space-x-3">
                  <Switch
                    checked={showOptionalFields}
                    onCheckedChange={setShowOptionalFields}
                  />
                  <Label className="font-medium cursor-pointer">
                    Landing Page mode
                  </Label>
                </div>
                {showOptionalFields ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </div>
            </div>

            {/* Optional fields */}
            {showOptionalFields && (
              <>
                <div className="md:col-span-2 space-y-2">
                  <Label className="flex items-center gap-1">
                    Images de description (optionnel)
                    {errors.descriptionImages && (
                      <span className="text-red-500 text-sm flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" /> {errors.descriptionImages}
                      </span>
                    )}
                  </Label>
                  <p className="text-sm text-gray-500">
                    Ces images apparaîtront avec la description du produit
                  </p>
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full h-32 flex flex-col items-center justify-center gap-2 border-dashed",
                        errors.descriptionImages ? "border-red-500" : "border-gray-300"
                      )}
                      onClick={() => document.getElementById("description-images")?.click()}
                    >
                      <Upload className="w-8 h-8 text-gray-400" />
                      <span className="text-sm text-gray-600">Cliquez pour télécharger des images de description</span>
                    </Button>
                    <input
                      id="description-images"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleDescriptionImageChange}
                      className="hidden"
                    />
                  </div>
                  {/* previews */}
                  {descriptionImagePreviewUrls.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {descriptionImagePreviewUrls.map((url, idx) => (
                        <img key={idx} src={url} alt="preview" className="w-24 h-24 object-cover rounded border" />
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        <DialogFooter className="pt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !isFormValid}>
            {isSubmitting ? "Création…" : "Créer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
