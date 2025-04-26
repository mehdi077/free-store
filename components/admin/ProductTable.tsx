"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import clsx from "clsx";
import { Id } from "@/convex/_generated/dataModel";
import { Trash2, ExternalLink } from "lucide-react";
import { useCallback, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import ProductEditDialog from "@/components/admin/ProductEditDialog"; // Import ProductEditDialog

// Interface defining the structure of a product expected by this table
export interface Product {
  _id: string | Id<"products">; // Accept string or Convex Id
  name: string;
  price: number;
  images: string[]; // Expect an array of image URLs
}

interface Props {
  products: Product[]; // Expect an array of Product objects
}

export default function ProductTable({ products }: Props) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Id<"products"> | null>(null);
  const deleteProduct = useMutation(api.products.deleteProduct);

  const handleDeleteClick = useCallback((productId: Id<"products">) => {
    setProductToDelete(productId);
    setIsDeleteDialogOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (productToDelete) {
      await deleteProduct({ productId: productToDelete });
      setIsDeleteDialogOpen(false);
      setProductToDelete(null);
    }
  }, [deleteProduct, productToDelete]);

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {/* Image Column Header */}
              <TableHead className="w-[60px] pl-4">Image</TableHead> {/* Added padding */}
              <TableHead>Produit</TableHead>
              <TableHead className="text-right pr-4">Prix</TableHead> {/* Right align price, add padding */}
              <TableHead className="w-[60px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Handle case where products might be empty */}
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-gray-500 py-4">
                  Aucun produit à afficher.
                </TableCell>
              </TableRow>
            ) : (
              products.map((p) => (
                <TableRow
                  key={p._id.toString()} // Use unique product ID as key
                  className={clsx("hover:bg-gray-50")}
                >
                  {/* Image Cell */}
                  <TableCell className="pl-4"> {/* Added padding */}
                    {p.images && p.images.length > 0 ? (
                      <img
                        src={p.images[0]} // Display the first image
                        alt={`Image for ${p.name}`} // Improved alt text
                        className="w-10 h-10 object-cover rounded border" // Added border
                        loading="lazy" // Added lazy loading
                      />
                    ) : (
                      // Placeholder if no images are available
                      <div className="w-10 h-10 bg-gray-100 border rounded flex items-center justify-center text-[10px] text-gray-400">
                        N/A
                      </div>
                    )}
                  </TableCell>
                  {/* Product Name Cell */}
                  <TableCell className="font-medium">{p.name}</TableCell>
                  {/* Price Cell */}
                  <TableCell className="text-right pr-4"> {/* Right align price, add padding */}
                    {p.price.toLocaleString('fr-DZ', { style: 'currency', currency: 'DZD', minimumFractionDigits: 0 })}
                  </TableCell>
                  {/* Actions Cell */}
                  <TableCell className="flex gap-2">
                    <ProductEditDialog productId={p._id as Id<"products">} onUpdated={() => { /* maybe refetch list via parent */ }} />
                    <a
                      href={`/product/${p._id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </a>
                    <button
                      onClick={() => handleDeleteClick(p._id as Id<"products">)}
                      className="p-2 text-red-500 hover:text-red-700 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-500 hover:bg-red-600">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}