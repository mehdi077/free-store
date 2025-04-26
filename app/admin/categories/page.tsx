"use client";

import CategoryTable, { Category } from "@/components/admin/CategoryTable";
import KPIWidget from "@/components/admin/KPIWidget";
import { Layers3, Plus } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function CategoriesPage() {
  const categories = useQuery(api.products.getCategoryAndProductCount);
  const addCategory = useMutation(api.categories.addCategory);
  const { toast } = useToast();
  
  const [isOpen, setIsOpen] = useState(false);
  const [nameFr, setNameFr] = useState("");
  const [nameAr, setNameAr] = useState("");

  // Transform the data to match the Category interface
  const formattedCategories: Category[] = categories?.map(category => ({
    _id: category._id,
    name_fr: category.name_fr,
    name_ar: category.name_ar,
    products_count: category.productCount
  })) || [];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Catégories</h1>

      <div className="flex justify-between items-center">
        <KPIWidget
          title="Nombre de catégories"
          value={formattedCategories.length}
          icon={<Layers3 className="w-5 h-5" />}
        />

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle catégorie
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer une nouvelle catégorie</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="name_fr">Nom (FR)</label>
                <Input
                  id="name_fr"
                  value={nameFr}
                  onChange={(e) => setNameFr(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="name_ar">Nom (AR)</label>
                <Input
                  id="name_ar"
                  value={nameAr}
                  onChange={(e) => setNameAr(e.target.value)}
                  dir="rtl"
                />
              </div>
              <Button
                className="w-full"
                onClick={async () => {
                  if (!nameFr || !nameAr) {
                    toast({
                      title: "Erreur",
                      description: "Veuillez remplir tous les champs",
                      variant: "destructive",
                    });
                    return;
                  }
                  await addCategory({ name_fr: nameFr, name_ar: nameAr });
                  setNameFr("");
                  setNameAr("");
                  setIsOpen(false);
                }}
              >
                Créer
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <CategoryTable 
        categories={formattedCategories} 
        onDelete={() => {
          toast({
            title: "Succès",
            description: "Catégorie supprimée avec succès",
          });
        }}
      />
    </div>
  );
}