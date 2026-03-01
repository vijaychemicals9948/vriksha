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

    const [modalOpen, setModalOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    const slugParam = params.slug;
    if (!slugParam) return notFound();

    const slug = Array.isArray(slugParam) ? slugParam[0] : slugParam;

    const category = PRODUCT_CATEGORIES[slug as string];

    if (!category) return notFound();

    // 🔹 If category has subcategories
    if (category.subcategories) {
        return (
            <>
                <HeroCover
                    desktopSrc={category.banner}
                    mobileSrc={category.mobileBanner}
                />
                <SubCategoryGrid
                    baseSlug={slug}
                    subcategories={category.subcategories}
                />
            </>
        );
    }

    // 🔹 Normal category with products
    if (!category.products) return notFound();

    return (
        <>
            <HeroCover
                desktopSrc={category.banner}
                mobileSrc={category.mobileBanner}
            />

            <ProductGrid
                products={category.products}
                onOpen={(i) => {
                    setActiveIndex(i);
                    setModalOpen(true);
                }}
            />

            <ImageModal
                products={category.products}
                open={modalOpen}
                activeIndex={activeIndex}
                onClose={() => {
                    setModalOpen(false);
                    setActiveIndex(null);
                }}
                onMove={(dir) => {
                    if (activeIndex === null) return;
                    setActiveIndex(
                        (activeIndex + dir + category.products!.length) %
                        category.products!.length
                    );
                }}
            />
        </>
    );
}

