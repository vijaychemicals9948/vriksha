//src/app/products/[slug]/page.tsx
"use client";

import { useState } from "react";
import { useParams, notFound } from "next/navigation";
import HeroCover from "@/app/components/products/HeroCover";
import ProductGrid from "@/app/components/products/ProductGrid";
import ImageModal from "@/app/components/products/ImageModal";
import SubCategoryGrid from "@/app/components/products/SubCategoryGrid";
import { PRODUCT_CATEGORIES } from "@/data/productsData";

export default function ProductCategoryPage() {
    const params = useParams();

    // ✅ Hooks ALWAYS at top
    const [modalOpen, setModalOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    const slugParam = params.slug;

    if (!slugParam) return notFound();

    const slug = Array.isArray(slugParam)
        ? slugParam[0]
        : slugParam;

    const category =
        PRODUCT_CATEGORIES[slug as keyof typeof PRODUCT_CATEGORIES];

    if (!category) return notFound();

    // ✅ Parent category → subcategories
    if ("subcategories" in category) {
        return (
            <>
                <HeroCover src={category.banner} />
                <SubCategoryGrid
                    baseSlug={slug}
                    subcategories={category.subcategories}
                />
            </>
        );
    }

    // ✅ Normal category → products
    const { banner, products } = category;

    return (
        <>
            <HeroCover src={banner} />

            <ProductGrid
                products={products}
                onOpen={(i) => {
                    setActiveIndex(i);
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
                        (activeIndex + dir + products.length) % products.length
                    );
                }}
            />
        </>
    );
}

