//src/app/products/[slug]/[subcategory]/page.tsx

"use client";

import { useParams, notFound } from "next/navigation";
import { useState } from "react";

import HeroCover from "@/app/components/products/HeroCover";
import ProductGrid from "@/app/components/products/ProductGrid";
import ImageModal from "@/app/components/products/ImageModal";

import { PRODUCT_CATEGORIES } from "@/data/productsData";

export default function SubCategoryPage() {
    const params = useParams();

    const slug = Array.isArray(params.slug)
        ? params.slug[0]
        : params.slug;

    const subSlug = Array.isArray(params.subcategory)
        ? params.subcategory[0]
        : params.subcategory;

    // modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    // parent category
    const parent =
        PRODUCT_CATEGORIES[slug as keyof typeof PRODUCT_CATEGORIES];

    if (!parent || !("subcategories" in parent)) return notFound();

    // current subcategory
    const subcategory = parent.subcategories.find(
        (s) => s.slug === subSlug
    );

    if (!subcategory) return notFound();

    return (
        <>
            {/* 🔹 Hero / Banner */}
            <HeroCover src={subcategory.banner} />

            {/* 🔹 Products Grid */}
            <ProductGrid
                products={subcategory.products}
                onOpen={(index: number) => {
                    setActiveIndex(index);
                    setModalOpen(true);
                }}
            />

            {/* 🔹 Image Modal */}
            <ImageModal
                products={subcategory.products}
                open={modalOpen}
                activeIndex={activeIndex}
                onClose={() => {
                    setModalOpen(false);
                    setActiveIndex(null);
                }}
                onMove={(dir: 1 | -1) => {
                    if (activeIndex === null) return;
                    setActiveIndex(
                        (activeIndex + dir + subcategory.products.length) %
                        subcategory.products.length
                    );
                }}
            />
        </>
    );
}

