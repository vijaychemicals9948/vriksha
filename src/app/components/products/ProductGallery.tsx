"use client";

import { useState } from "react";
import ProductGrid from "@/app/components/products/ProductGrid";
import ImageModal from "@/app/components/products/ImageModal";
import type { Product } from "@/types/catalog";

export default function ProductGallery({ products }: { products: Product[] }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <>
      <ProductGrid
        products={products}
        onOpen={(index) => {
          setActiveIndex(index);
          setModalOpen(true);
        }}
      />

      <ImageModal
        products={products}
        open={modalOpen}
        activeIndex={activeIndex}
        onClose={() => {
          setModalOpen(false);
          setActiveIndex(null);
        }}
        onMove={(dir) => {
          if (activeIndex === null) return;
          setActiveIndex(
            (activeIndex + dir + products.length) % products.length,
          );
        }}
      />
    </>
  );
}
