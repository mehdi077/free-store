"use client";

import Image from "next/image";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { Copy, Check, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";

interface Props {
  images: { url: string; storageId: string }[];
  onImageDeleted?: () => void;
}

export default function ImageGallery({ images, onImageDeleted }: Props) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const deleteImage = useMutation(api.storage.deleteStorageImage);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteImage = async (storageId: string) => {
    try {
      setIsDeleting(true);
      await deleteImage({ storageId });
      toast.success("Image supprimée avec succès");
      onImageDeleted?.();
    } catch (error) {
      console.error("Error deleting image:", error);
      toast.error("Erreur lors de la suppression de l'image");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
      {images.map((image, index) => (
        <Card key={image.storageId} className="p-0 overflow-hidden flex flex-col shadow-md hover:shadow-lg transition-all duration-200">
          <Image
            src={image.url}
            alt="Image"
            width={400}
            height={400}
            className="object-cover w-full h-48"
          />
          <div className="p-3 border-t border-gray-100 space-y-2">
            <button
              type="button"
              title="Copy image URL / Copier l'URL de l'image"
              aria-label="Copy image URL / Copier l'URL de l'image"
              onClick={() => {
                navigator.clipboard.writeText(image.url);
                setCopiedIndex(index);
                setTimeout(() => setCopiedIndex(null), 2000);
              }}
              className={`flex items-center justify-center w-full gap-2 py-2 rounded-md transition-colors ${copiedIndex === index ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
            >
              {copiedIndex === index ? (
                <>
                  <Check className="w-4 h-4" />
                  <span className="text-sm font-medium">URL Copiée</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span className="text-sm font-medium">{"Copier l'URL"}</span>
                </>
              )}
            </button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button
                  type="button"
                  disabled={isDeleting}
                  className="flex items-center justify-center w-full gap-2 py-2 rounded-md transition-colors bg-red-50 text-red-600 hover:bg-red-100"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="text-sm font-medium">Supprimer</span>
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-red-600">Confirmation de suppression</AlertDialogTitle>
                  <AlertDialogDescription className="text-red-500">
                    {"Attention : Cette image pourrait être utilisée dans une ou plusieurs pages de produits. "}
                    {"Sa suppression pourrait affecter l'affichage des produits concernés."}
                    <br /><br />
                    Êtes-vous sûr de vouloir supprimer cette image ?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleDeleteImage(image.storageId)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Supprimer
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </Card>
      ))}
    </div>
  );
}
