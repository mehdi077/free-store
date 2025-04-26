'use client';
import React, { useState } from "react";
import { api } from "@/convex/_generated/api";
import { useQuery, useMutation } from "convex/react";
import ImageGallery from "@/components/admin/ImageGallery";
import { Button } from "@/components/ui/button";
import { Upload, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS_PER_PAGE = 5;

export default function GalleryPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const data = useQuery(api.storage.getAllStorageImages, { page: currentPage });
  const isLoading = data === undefined;
  const images = data?.images ?? [];
  
  // Image upload states
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  
  // Convex mutations
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);
  
  // Handle file selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imgs = files.filter((f) => f.type.startsWith("image/"));
    
    if (imgs.length === 0) return;
    
    const newPreviewUrls = imgs.map((img) => URL.createObjectURL(img));
    
    setUploadedImages((prev) => [...prev, ...imgs]);
    setPreviewUrls((prev) => [...prev, ...newPreviewUrls]);
    setError("");
  };
  
  // Upload images to storage
  const handleUpload = async () => {
    if (uploadedImages.length === 0) {
      setError("Veuillez sélectionner au moins une image à télécharger.");
      return;
    }
    
    setIsUploading(true);
    setError("");
    
    try {
      // Upload each image to storage
      for (const image of uploadedImages) {
        const uploadUrl = await generateUploadUrl();
        
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": image.type },
          body: image,
        });
        
        if (!result.ok) {
          throw new Error(`Erreur lors du téléchargement: ${result.statusText}`);
        }
      }
      
      // Clear the form after successful upload
      setUploadedImages([]);
      setPreviewUrls([]);
      
      // Refresh the data to show the new images
      setCurrentPage(1);
    } catch (err) {
      setError(`Erreur de téléchargement: ${err instanceof Error ? err.message : 'Erreur inconnue'}`);
    } finally {
      setIsUploading(false);
    }
  };
  
  // Clear selected images
  const handleClearImages = () => {
    setUploadedImages([]);
    setPreviewUrls([]);
    setError("");
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Galerie</h1>
      
      {/* Image upload section */}
      <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
        <h2 className="text-xl font-semibold">Ajouter des images</h2>
        
        <div className="flex flex-col gap-2">
          <Button
            variant="outline"
            className={cn(
              "w-full h-32 flex flex-col items-center justify-center gap-2 border-dashed",
              error ? "border-red-500" : "border-gray-300"
            )}
            onClick={() => document.getElementById("gallery-images")?.click()}
            disabled={isUploading}
          >
            <Upload className="w-8 h-8 text-gray-400" />
            <span className="text-sm text-gray-600">Cliquez pour télécharger des images à la galerie</span>
          </Button>
          <input
            id="gallery-images"
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
        </div>
        
        {/* Error message */}
        {error && (
          <div className="text-red-500 text-sm flex items-center gap-1">
            <AlertCircle className="w-4 h-4" /> {error}
          </div>
        )}
        
        {/* Image previews */}
        {previewUrls.length > 0 && (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2 mt-2">
              {previewUrls.map((url, idx) => (
                <img key={idx} src={url} alt="preview" className="w-24 h-24 object-cover rounded border" />
              ))}
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={handleUpload}
                disabled={isUploading || uploadedImages.length === 0}
                className="flex-1"
              >
                {isUploading ? "Téléchargement en cours..." : "Télécharger les images"}
              </Button>
              
              <Button
                variant="outline"
                onClick={handleClearImages}
                disabled={isUploading || uploadedImages.length === 0}
              >
                Effacer la sélection
              </Button>
            </div>
          </div>
        )}
      </div>
      
      {/* Gallery display section */}
      {isLoading ? (
        <p>Chargement des images...</p>
      ) : images.length === 0 && currentPage === 1 ? (
        <p className="text-gray-500">Aucune image trouvée.</p>
      ) : images.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 text-gray-500 py-8">
          <AlertCircle className="w-8 h-8" />
          <p>Plus aucune image disponible sur cette page.</p>
          <Button
            variant="outline"
            onClick={() => setCurrentPage(1)}
            className="mt-2"
          >
            Retourner à la première page
          </Button>
        </div>
      ) : (
        <ImageGallery 
          images={images} 
          onImageDeleted={() => setCurrentPage(1)} 
        />
      )}
      
      {/* Pagination */}
      {images.length > 0 && (
        <div className="flex justify-center items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Précédent
          </Button>
          <span className="text-sm">Page {currentPage}</span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage((prev) => prev + 1)}
            disabled={images.length < ITEMS_PER_PAGE}
          >
            Suivant
          </Button>
        </div>
      )}
    </div>
  );
}
