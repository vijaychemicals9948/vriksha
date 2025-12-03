"use client";

import { useState } from "react";
import HeroCover from "./HeroCover";
import ProductGrid from "./ProductGrid";
import ImageModal from "./ImageModal";
import styles from "./BrassOnSilk.module.css"; // 👈 NEW

const PRODUCTS = [
    { id: 1, title: "Ganesha Face 16x16", img: "/products/brass-on-silk/01-ganesha.jpg" },
    { id: 2, title: "Aandaal 10x12", img: "/products/brass-on-silk/aandaal.png" },
    { id: 3, title: "Balaji on lotuss 10x12", img: "/products/brass-on-silk/balaji-on-lotuss.png" },
    { id: 4, title: "Aandaal 10x12", img: "/products/brass-on-silk/aandaal.png" },
    { id: 5, title: "Ganesha Face 16x16", img: "/products/brass-on-silk/01-ganesha.jpg" },
    { id: 6, title: "Balaji on lotuss 10x12", img: "/products/brass-on-silk/balaji-on-lotuss.png" },
    { id: 7, title: "Ganesha Face 16x16", img: "/products/brass-on-silk/01-ganesha.jpg" },
    { id: 8, title: "Aandaal 10x12", img: "/products/brass-on-silk/aandaal.png" },
    { id: 9, title: "Balaji on lotuss 10x12", img: "/products/brass-on-silk/balaji-on-lotuss.png" },
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
        <div className={styles.pageFade}>   {/* 👈 ANIMATION WRAPPER */}
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
        </div>
    );
}
