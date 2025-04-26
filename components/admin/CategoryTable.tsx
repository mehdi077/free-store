"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useMutation } from "convex/react";
import { useState } from "react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Trash2, ExternalLink } from "lucide-react";

export interface Category {
  _id: string;
  name_fr: string;
  name_ar: string;
  products_count: number;
}

interface Props {
  categories: Category[];
  onDelete?: () => void;
}

export default function CategoryTable({ categories, onDelete }: Props) {
  const removeCategory = useMutation(api.categories.removeCategory);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>#</TableHead>
            <TableHead>Nom (FR)</TableHead>
            <TableHead>Nom (AR)</TableHead>
            <TableHead>Produits</TableHead>
            <TableHead className="w-[50px]"></TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((c, i) => (
            <TableRow key={c._id} className="hover:bg-gray-50">
              <TableCell>{i + 1}</TableCell>
              <TableCell className="font-medium">{c.name_fr}</TableCell>
              <TableCell>{c.name_ar}</TableCell>
              <TableCell>{c.products_count}</TableCell>
              <TableCell>
                <a
                  href={`/category/${c._id}`}
                  target="_blank"
                  className="p-2 text-gray-600 hover:text-gray-800 transition-colors inline-block"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </TableCell>
              <TableCell>
                <button
                  onClick={() => setCategoryToDelete(c)}
                  className="p-2 text-red-600 hover:text-red-800 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={!!categoryToDelete} onOpenChange={(open) => !open && setCategoryToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmation de suppression</DialogTitle>
            <DialogDescription>
              <div className="space-y-2 pt-3">
                <div>
                  Si vous supprimez cette catégorie, tous les produits associés
                  (<span className="text-red-600 font-bold">{categoryToDelete?.products_count} produits</span>)
                  seront également supprimés.
                </div>
                <div>Êtes-vous sûr de vouloir supprimer cette catégorie ?</div>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setCategoryToDelete(null)}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (categoryToDelete) {
                  await removeCategory({ categoryId: categoryToDelete._id as Id<"categories"> });
                  onDelete?.();
                  setCategoryToDelete(null);
                }
              }}
            >
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
