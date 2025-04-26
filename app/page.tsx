'use client'

import SlideByCategory from "@/components/SlideByCategory";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect } from "react";

export default function Home() {
  const categories = useQuery(api.products.getAllCategories);
  const productCounts = useQuery(api.products.getCategoryAndProductCount);
  
  // Move useEffect before any conditional returns
  useEffect(() => {
    return () => {
      // This will clean up the scroll states when navigating away from home
      const scrollContainers = document.querySelectorAll('.scrollbar-hide');
      scrollContainers.forEach(container => {
        container.scrollTo({ left: 0 });
      });
    };
  }, []);

  const getCount = (categoryId: Id<"categories">) => {
    if (!productCounts) return 0;
    const category = productCounts.find(cat => cat._id === categoryId);
    return category ? category.productCount : 0;
  };

  if (!categories || !productCounts) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 py-4 max-w-md mx-auto md:max-w-6xl md:px-8">
      {categories.map((category) => (
        <SlideByCategory
          key={category._id}
          categoryId={category._id}
          totalProdCount={getCount(category._id)}
        />
      ))}
    </div>
  );
}

// Add this CSS to hide scrollbar but keep functionality
const styles = `
.scrollbar-hide {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;  /* Chrome, Safari and Opera */
}
`;

// Add the styles to the document
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}