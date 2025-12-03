"use client";

import { useState } from "react";
import HeroCover from "./HeroCover";
import ProductGrid from "./ProductGrid";
import ImageModal from "./ImageModal";

const PRODUCTS = [
    { id: 1, title: "Brass Idol 1", img: "/products/brass-on-silk/01-ganesha.jpg" },
    { id: 2, title: "Brass Idol 2", img: "/products/brass-on-silk/01-ganesha.jpg" },
    { id: 3, title: "Brass Idol 3", img: "/products/brass-on-silk/01-ganesha.jpg" },
    { id: 4, title: "Brass Idol 4", img: "/products/brass-on-silk/01-ganesha.jpg" },
    { id: 5, title: "Brass Idol 5", img: "/products/brass-on-silk/01-ganesha.jpg" },
    { id: 6, title: "Brass Idol 6", img: "/products/brass-on-silk/01-ganesha.jpg" },
    { id: 7, title: "Brass Idol 7", img: "/products/brass-on-silk/01-ganesha.jpg" },
    { id: 8, title: "Brass Idol 8", img: "/products/brass-on-silk/01-ganesha.jpg" },
];

export default function BrassOnSilkPage() {
    const [modalOpen, setModalOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    function openModalAt(i: number) {
        setActiveIndex(i);
        setModalOpen(true);
    }

    function closeModal() {
        setModalOpen(false);
        setActiveIndex(null);
    }

    function move(direction: 1 | -1) {
        if (activeIndex === null) return;
        const next = (activeIndex + direction + PRODUCTS.length) % PRODUCTS.length;
        setActiveIndex(next);
    }

    return (
        <>
            <HeroCover src="/products/brass-on-silk/brass-idols-on-silk.png" />

            <h1 style={{ textAlign: "center", margin: "40px 0" }}>
                Brass Idols on Silk
            </h1>

            <ProductGrid products={PRODUCTS} onOpen={openModalAt} />

            <ImageModal
                products={PRODUCTS}
                open={modalOpen}
                activeIndex={activeIndex}
                onClose={closeModal}
                onMove={move}
            />
        </>
    );
}
