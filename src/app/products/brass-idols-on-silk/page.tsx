"use client";

import { useEffect, useState } from "react";
import styles from "./BrassOnSilk.module.css";

export default function BrassOnSilkPage() {
    const [mounted, setMounted] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    useEffect(() => {
        const t = requestAnimationFrame(() => setMounted(true));
        return () => cancelAnimationFrame(t);
    }, []);

    // lock scroll when modal open
    useEffect(() => {
        if (modalOpen) {
            const prev = document.documentElement.style.overflow;
            document.documentElement.style.overflow = "hidden";
            return () => { document.documentElement.style.overflow = prev; };
        }
    }, [modalOpen]);

    // keyboard controls: Esc to close, arrows to navigate
    useEffect(() => {
        function onKey(e: KeyboardEvent) {
            if (!modalOpen) return;
            if (e.key === "Escape") setModalOpen(false);
            if (e.key === "ArrowRight") move(1);
            if (e.key === "ArrowLeft") move(-1);
        }
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [modalOpen, activeIndex]);

    const products = [
        { id: 1, title: "Brass Idol 1", img: "/products/brass-on-silk/b1.png" },
        { id: 2, title: "Brass Idol 2", img: "/products/brass-on-silk/b1.png" },
        { id: 3, title: "Brass Idol 3", img: "/products/brass-on-silk/b1.png" },
        { id: 4, title: "Brass Idol 4", img: "/products/brass-on-silk/b1.png" },
        { id: 5, title: "Brass Idol 5", img: "/products/brass-on-silk/b1.png" },
        { id: 6, title: "Brass Idol 6", img: "/products/brass-on-silk/b1.png" },
        { id: 7, title: "Brass Idol 7", img: "/products/brass-on-silk/b1.png" },
        { id: 8, title: "Brass Idol 8", img: "/products/brass-on-silk/b1.png" },
    ];

    function openModalAt(i: number) {
        setActiveIndex(i);
        setModalOpen(true);
    }

    function move(direction: 1 | -1) {
        if (activeIndex === null) return;
        const next = (activeIndex + direction + products.length) % products.length;
        setActiveIndex(next);
    }

    return (
        <>
            {/* Full-Screen Banner */}
            <div className={styles.heroSection}>
                <img
                    src="/products/brass-on-silk/brass-on-silk-cover2.png"
                    alt="Brass idols on silk"
                    className={`${styles.heroImage} ${mounted ? styles.heroImageEnter : ""}`}
                />
            </div>

            {/* Page Content */}
            <div className={`${styles.pageWrap} ${mounted ? styles.pageWrapEnter : ""}`}>
                <h1 className={`${styles.title} ${mounted ? styles.titleEnter : ""}`}>
                    Brass Idols on Silk
                </h1>

                <div className={styles.grid}>
                    {products.map((p, i) => (
                        <div
                            key={p.id}
                            className={`${styles.card} ${mounted ? styles.cardEnter : ""}`}
                            style={{ transitionDelay: `${i * 80}ms` }}
                        >
                            <div
                                className={styles.imgWrap}
                                // click opens modal
                                onClick={() => openModalAt(i)}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") openModalAt(i);
                                }}
                                aria-label={`Open ${p.title} image fullscreen`}
                            >
                                <img src={p.img} alt={p.title} className={styles.productImg} />
                            </div>
                            <h3 className={styles.productTitle}>{p.title}</h3>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal */}
            {modalOpen && activeIndex !== null && (
                <div
                    className={styles.modalOverlay}
                    onClick={(e) => {
                        // close if clicking backdrop (not the image container)
                        if ((e.target as HTMLElement).dataset.role === "overlay") setModalOpen(false);
                    }}
                    data-role="overlay"
                    aria-modal="true"
                    role="dialog"
                >
                    <div className={styles.modalInner}>
                        <button
                            className={styles.modalClose}
                            onClick={() => setModalOpen(false)}
                            aria-label="Close image"
                        >
                            ×
                        </button>

                        <button
                            className={styles.modalNav + " " + styles.prev}
                            onClick={() => move(-1)}
                            aria-label="Previous image"
                        >
                            ‹
                        </button>

                        <div className={styles.modalContent}>
                            <img
                                src={products[activeIndex].img}
                                alt={products[activeIndex].title}
                                className={styles.modalImage}
                            />
                            <div className={styles.modalCaption}>{products[activeIndex].title}</div>
                        </div>

                        <button
                            className={styles.modalNav + " " + styles.next}
                            onClick={() => move(1)}
                            aria-label="Next image"
                        >
                            ›
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
