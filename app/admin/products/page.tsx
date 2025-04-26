'use client'; 

import ProductTable, { Product } from "@/components/admin/ProductTable";
import KPIWidget from "@/components/admin/KPIWidget";
import { Package } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ProductCreateDialog from "@/components/admin/ProductCreateDialog";

const ITEMS_PER_PAGE = 20;

// Ensure this matches the updated Product interface in ProductTable
interface AdminProduct extends Product {
  images: string[];
  _id: Id<"products">; 
  category: string;
}


export default function ProductsPage() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<Id<"categories"> | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [refreshToggle, setRefreshToggle] = useState(false);

  // 1. Fetch total product count
  const totalProductCountData = useQuery(api.products.getTotalProductCount);

  // 2. Fetch all categories
  const categories = useQuery(api.products.getAllCategories);

  // 3. Fetch paginated products for the selected category
  // Note: Ensure getProductsByCategoryPaginated returns products with 'images' and category name/ID
  const paginatedProducts = useQuery(
    api.products.getProductsByCategoryPaginated,
    selectedCategoryId
      ? { categoryId: selectedCategoryId, page: currentPage } 
      : "skip" // Skip query if no category is selected
  );

  // 4. Fetch product count for the selected category (for pagination)
  const categoryProductCountData = useQuery(
    api.products.getProductCountByCategory,
    selectedCategoryId ? { categoryId: selectedCategoryId } : "skip"
  );

  // Reset page to 1 when category changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategoryId]);

  // Optional: Scroll effect (consider UX)
  // useEffect(() => {
  //   if (paginatedProducts) {
  //       // window.scrollTo({ top: 0, behavior: 'smooth' });
  //   }
  // }, [currentPage, selectedCategoryId, paginatedProducts]);


  const handleCategoryChange = (value: string) => {
    if (value === "all") {
      setSelectedCategoryId(null);
    } else {
      setSelectedCategoryId(value as Id<"categories">);
    }
    // setCurrentPage(1); // Already handled by useEffect
  };

  // Loading states
  const isLoadingCategories = categories === undefined;
  const isLoadingTotalCount = totalProductCountData === undefined;
  const isLoadingProducts = selectedCategoryId !== null && (paginatedProducts === undefined || categoryProductCountData === undefined);

  // Derived data
  const productsToShow: AdminProduct[] = (selectedCategoryId && paginatedProducts?.products) ? paginatedProducts.products as AdminProduct[] : [];
  const totalPages = categoryProductCountData?.totalPages ?? 0;
  const totalCategoryProducts = categoryProductCountData?.totalProducts ?? 0;

  const startItem = totalCategoryProducts > 0 ? ((currentPage - 1) * ITEMS_PER_PAGE) + 1 : 0;
  const endItem = totalCategoryProducts > 0 ? Math.min(currentPage * ITEMS_PER_PAGE, totalCategoryProducts) : 0;


  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Produits</h1>

      {/* KPIs and Category Selector */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
         {/* Total Products KPI */}
        <div className="md:col-span-1">
            <KPIWidget
              title="Total produits"
              value={isLoadingTotalCount ? "..." : totalProductCountData}
              icon={<Package className="w-5 h-5" />}
            />

        </div>

        {/* Category Selector */}
        <div className="md:col-span-3">
           <label htmlFor="category-select" className="block text-sm font-medium text-gray-700 mb-1">
                Filtrer par catégorie
            </label>
            <Select
              onValueChange={handleCategoryChange}
              value={selectedCategoryId ?? "all"}
              disabled={isLoadingCategories}
            >
                <SelectTrigger id="category-select" className="w-full md:w-[400px]">
                    <SelectValue placeholder={isLoadingCategories ? "Chargement..." : "Sélectionner une catégorie"} />
                </SelectTrigger>
                <SelectContent className="min-w-[400px] max-h-[60vh] overflow-y-auto">
                  {!isLoadingCategories && (
                    <>
                      <SelectItem value="all">Toutes les catégories (Non filtré)</SelectItem>
                      {categories?.map((category) => (
                          <SelectItem key={category._id} value={category._id}>
                              {category.name_ar} - {category.name_fr}
                          </SelectItem>
                      ))}
                    </>
                  )}
                </SelectContent>
            </Select>
        </div>

        <ProductCreateDialog onCreated={() => setRefreshToggle(!refreshToggle)} />

      </div>

      {/* Product Table and Pagination Area */}
      <div className="mt-6">
        {/* Message when no category is selected */}
        {!selectedCategoryId && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-md text-center">
                <p className="text-sm text-blue-700">Veuillez sélectionner une catégorie pour voir les produits.</p>
            </div>
        )}

        {/* Content when a category IS selected */}
        {selectedCategoryId && (
          <div className="space-y-4">
            {/* Loading Indicator */}
            {isLoadingProducts && <p className="text-center text-gray-500">Chargement des produits...</p>}

            {/* No Products Found */}
            {!isLoadingProducts && productsToShow.length === 0 && (
              <p className="text-center text-gray-500">Aucun produit trouvé pour cette catégorie.</p>
            )}

            {/* Products Table and Pagination */}
            {!isLoadingProducts && productsToShow.length > 0 && (
              <>
                {/* Pagination Info */}
                <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-gray-600 gap-2">
                  <span>{totalCategoryProducts} produit(s) trouvé(s)</span>
                  <span>Page {currentPage} sur {totalPages} ({startItem}-{endItem})</span>
                </div>

                {/* Product Table */}
                <ProductTable products={productsToShow} />

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="flex justify-center items-center py-4">
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                            >
                                Précédent
                            </Button>

                             <span className="text-sm text-gray-700 px-2">
                                Page {currentPage} / {totalPages}
                             </span>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                            >
                                Suivant
                            </Button>
                        </div>
                    </div>
                )}
              </>
            )}
          </div>
        )}
      </div> {/* End Product Table and Pagination Area */}
    </div>
  );
}
