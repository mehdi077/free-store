'use client'

import React, { useState, useEffect } from 'react'
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { ShoppingCart, ChevronRight, Home, Tag, ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { PRODUCTS_PER_PAGE } from "@/convex/constants";
// Removed Button, Card, Typography imports from MUI as we'll primarily use Tailwind
// If you use Card/Typography elsewhere, keep them, but for this specific component,
// Tailwind classes on standard elements are used for consistency.
// import { Button, Card, Typography } from '@mui/material';

interface CategoryPageProps {
  params: Promise<{
    id: Id<"categories">
  }>
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const resolvedParams = React.use(params);
  const [currentPage, setCurrentPage] = useState(1);

  const paginatedProducts = useQuery(api.products.getProductsByCategoryPaginated, {
    categoryId: resolvedParams.id,
    page: currentPage
  });

  const productCount = useQuery(api.products.getProductCountByCategory, {
    categoryId: resolvedParams.id
  });

  const category = useQuery(api.products.getCategoryById, { categoryId: resolvedParams.id });

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]); // Trigger scroll only when currentPage changes

  // Enhanced Loading State (Skeleton) - Adjusted grid cols for responsiveness
  if (!paginatedProducts || !category || !productCount) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Skeleton Breadcrumb */}
        <div className="h-5 bg-gray-200 w-48 rounded-md animate-pulse mb-6"></div>

        {/* Skeleton Header */}
        <div className="h-8 bg-gray-200 w-64 rounded-md animate-pulse mb-4"></div>
        <div className="h-5 bg-gray-200 w-40 rounded-md animate-pulse mb-4"></div>
        <div className="h-6 bg-gray-200 w-24 rounded-full animate-pulse mb-8"></div>

        {/* Skeleton Grid - Adjusted for mobile responsiveness */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
          {[...Array(PRODUCTS_PER_PAGE)].map((_, index) => ( // Use PRODUCTS_PER_PAGE for skeleton count
            <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
              <div className="aspect-square bg-gray-200 animate-pulse"></div>
              <div className="p-3 sm:p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 w-2/3 rounded animate-pulse"></div>
                <div className="h-9 bg-gray-200 rounded-md animate-pulse mt-2"></div> {/* Skeleton for button */}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const startItem = ((currentPage - 1) * PRODUCTS_PER_PAGE) + 1;
  const endItem = Math.min(currentPage * PRODUCTS_PER_PAGE, productCount.totalProducts);
  const totalPages = productCount.totalPages; // Use totalPages directly

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section - Adjusted padding */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-1.5 sm:space-x-2 text-sm" aria-label="Breadcrumb">
            <Link href="/" className="flex items-center text-gray-500 hover:text-gray-800 transition-colors">
              <Home className="h-4 w-4 flex-shrink-0" />
              <span className="ml-1 hidden sm:inline">Accueil</span>
            </Link>
            <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" aria-hidden="true" />
            <span className="font-medium text-gray-700 truncate" aria-current="page">{category.name_fr}</span>
          </nav>

          {/* Category Header - Adjusted margins and text sizes */}
          <div className="mt-3 sm:mt-4 flex items-start justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{category.name_fr}</h1>
              {/* Optionally hide Arabic name on very small screens if needed */}
              <p className="mt-0.5 text-sm text-gray-500">{category.name_ar}</p>
            </div>
          </div>
          {/* Product Count Badge */}
          <div className="inline-flex items-center bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full mt-3 sm:mt-4">
            <Tag className="h-4 w-4 mr-1.5" />
            <span className="text-xs sm:text-sm font-medium">
              {productCount.totalProducts} {productCount.totalProducts === 1 ? 'produit' : 'produits'}
            </span>
          </div>
        </div>
      </div>

      {/* Products Grid - Adjusted grid columns and padding */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
          {paginatedProducts.products.map((product) => (
            // The Link now wraps the entire card, making the whole thing clickable
            <Link href={`/product/${product._id}`} key={product._id} className="group block">
              {/* Card implemented with standard div and Tailwind */}
              <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow duration-200 h-full flex flex-col">
                <div className="aspect-square overflow-hidden">
                  <img
                    src={product.images[0]} // Consider adding error handling or placeholder
                    alt={product.name} // Good practice for alt text
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-in-out"
                    loading="lazy" // Add lazy loading for images below the fold
                  />
                </div>
                {/* Card Content - Adjusted padding */}
                <div className="p-3 sm:p-4 flex flex-col flex-grow"> {/* Use flex-grow to push button down */}
                  <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 mb-2 flex-grow-0"> {/* Use h3 for semantics */}
                    {product.name}
                  </h3>

                  {/* Price Section */}
                  <div className="mt-auto pt-2"> {/* Push price and button down */}
                    {product.promo_price ? (
                      <div className="space-y-1 mb-3">
                        <div className="flex items-baseline gap-2 flex-wrap"> {/* Allow wrap for price */}
                          <span className="text-base sm:text-lg font-bold text-red-600">
                            {product.promo_price.toLocaleString('fr-DZ')} DA {/* Locale formatting */}
                          </span>
                          <span className="text-xs sm:text-sm text-gray-500 line-through">
                            {product.price.toLocaleString('fr-DZ')} DA
                          </span>
                        </div>
                        <div className="inline-block bg-red-100 text-red-700 text-xs font-medium px-2 py-0.5 rounded">
                          -{Math.round(((product.price - product.promo_price) / product.price) * 100)}%
                        </div>
                      </div>
                    ) : (
                      <div className="mb-3">
                         <span className="text-base sm:text-lg font-bold text-gray-900">
                           {product.price.toLocaleString('fr-DZ')} DA
                         </span>
                      </div>
                    )}

                    {/* --- Improved Buy Button --- */}
                    {/* Using a standard button styled with Tailwind for better control and consistency */}
                    {/* Removed onClick handler - navigation is handled by the wrapping Link */}
                    {/* Added type="button" */}
                    <button
                      type="button" // Important for buttons inside links/forms
                      className="w-full bg-[#102161] text-white py-2 px-3 rounded-md text-sm font-medium flex items-center justify-center gap-2 hover:bg-opacity-90 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#102161] focus:ring-offset-2 active:scale-95"
                      aria-label={`Acheter ${product.name}`} // Better accessibility
                    >
                      <ShoppingCart className="h-4 w-4" />
                      <span>Acheter</span> {/* Kept simple */}
                    </button>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Pagination - Improved styling and responsiveness */}
        {totalPages > 1 && ( // Only show pagination if needed
          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 pt-6 gap-4">
            {/* Info Text */}
            <p className="text-sm text-gray-600 order-2 sm:order-1"> {/* Adjusted order for mobile */}
              Affichage de <span className="font-medium">{startItem}</span> à{' '}
              <span className="font-medium">{endItem}</span> sur{' '}
              <span className="font-medium">{productCount.totalProducts}</span> produits
            </p>

            {/* Buttons Container */}
            <div className="flex items-center gap-1 sm:gap-2 order-1 sm:order-2"> {/* Adjusted gap */}
              {/* Previous Button */}
              <button
                onClick={() => {
                  if (currentPage > 1) {
                    setCurrentPage(currentPage - 1);
                  }
                }}
                disabled={currentPage === 1}
                className={`inline-flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#102161] focus:ring-offset-1
                  ${currentPage === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 shadow-sm'
                  }`}
                 aria-label="Page précédente"
              >
                <ArrowLeft className="h-4 w-4 sm:mr-1" /> {/* Hide text on mobile potentially */}
                <span className="hidden sm:inline">Précédent</span>
              </button>

              {/* Page Numbers (Improved Logic) */}
              <div className="flex items-center gap-1">
                {renderPaginationButtons(currentPage, totalPages, setCurrentPage)}
              </div>

              {/* Next Button */}
              <button
                onClick={() => {
                  if (currentPage < totalPages) {
                    setCurrentPage(currentPage + 1);
                  }
                }}
                disabled={currentPage === totalPages}
                className={`inline-flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#102161] focus:ring-offset-1
                  ${currentPage === totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 shadow-sm'
                  }`}
                aria-label="Page suivante"
              >
                <span className="hidden sm:inline">Suivant</span>
                <ArrowRight className="h-4 w-4 sm:ml-1" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper function for cleaner pagination logic
function renderPaginationButtons(currentPage: number, totalPages: number, setCurrentPage: (page: number) => void) {
  const pageNumbers = [];
  const maxPagesToShow = 5; // Max buttons including ellipsis (e.g., 1 ... 5 6 7 ... 10)
  const halfMax = Math.floor(maxPagesToShow / 2);

  // Always show first page
  pageNumbers.push(1);

  // Ellipsis before current pages?
  if (currentPage > halfMax + 1) {
    pageNumbers.push('...');
  }

  // Calculate start and end page numbers around current
  let startPage = Math.max(2, currentPage - halfMax + (maxPagesToShow % 2 === 0 ? 1 : 0));
  let endPage = Math.min(totalPages - 1, currentPage + halfMax);

  // Adjust start/end if close to beginning/end
  if (currentPage <= halfMax) {
    endPage = Math.min(totalPages - 1, maxPagesToShow - 1);
  }
  if (currentPage >= totalPages - halfMax +1 ) {
    startPage = Math.max(2, totalPages - maxPagesToShow + 2);
  }


  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  // Ellipsis after current pages?
  if (currentPage < totalPages - halfMax) {
    pageNumbers.push('...');
  }

  // Always show last page (if more than 1 page)
  if (totalPages > 1) {
    pageNumbers.push(totalPages);
  }

  // Remove duplicates if totalPages is small
  const uniquePageNumbers = [...new Set(pageNumbers)];


  return uniquePageNumbers.map((page, index) => {
    if (page === '...') {
      return <span key={`ellipsis-${index}`} className="px-2 py-2 text-sm text-gray-500">...</span>;
    }

    const pageNumber = page as number;
    const isCurrentPage = currentPage === pageNumber;

    return (
      <button
        key={pageNumber}
        onClick={() => setCurrentPage(pageNumber)}
        className={`hidden sm:inline-flex items-center justify-center px-3 py-1.5 min-w-[32px] h-[32px] text-sm font-medium rounded-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#102161] focus:ring-offset-1
          ${isCurrentPage
            ? 'bg-[#102161] text-white z-10 border border-[#102161]'
            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
          }`}
        aria-current={isCurrentPage ? 'page' : undefined}
        aria-label={`Aller à la page ${pageNumber}`}
      >
        {pageNumber}
      </button>
    );
  });
}