"use client";
import React from "react";
import Link from "next/link";
import OutlineBox from "./OutlineBox3";
import CategoryCard from "./CategoryCard";
import styles from "./CategoriesSection.module.css";

const images = [
    {
        src: "/homepage/categories/brass-idols-on-silk-vertical.webp",
        alt: "Brass Idols on Silk",
        title: "Brass Idols on Silk",
        href: "/products/brass-idols-on-silk",
    },
    {
        src: "/homepage/categories/brass-idols-on-gold-metal-vertical.webp",
        alt: "Brass Idols on Gold Metal Art",
        title: "Brass Idols on Gold Metal Art",
        href: "/products/brass-idols-on-gold-metal-art",
    },
    {
        src: "/homepage/categories/brass-on-solid-wood-vertical.webp",
        alt: "Brass on Solid Wood",
        title: "Brass on Solid Wood",
        href: "/products/brass-on-solid-wood",
    },
    {
        src: "/homepage/categories/pooja-room-series-vertical.webp",
        alt: "Pooja Room Series",
        title: "Pooja Room Series",
        href: "/products/pooja-room-series",
    },
    {
        src: "/homepage/categories/gold-metalart-vertical.webp",
        alt: "Gold Metal Art",
        title: "Gold Metal Art",
        href: "/products/gold-metal-art",
    },
    {
        src: "/homepage/categories/indian-art-on-prabhavali-vertical.webp",
        alt: "Indian Art on Prabhavali",
        title: "Indian Art on Prabhavali",
        href: "/products/indian-art-on-prabhavali",
    },
    {
        src: "/homepage/categories/serving-trays-vertical.webp",
        alt: "Serving Trays",
        title: "Serving Trays",
        href: "/products/serving-trays",
    },
    {
        src: "/homepage/categories/mementos-vertical.webp",
        alt: "Mementos",
        title: "Mementos",
        href: "/products/mementos",
    },

];

export default function CategoriesSection() {
    return (
        <section className={styles.pageWrapper}>
            <OutlineBox>
                <div className={styles.sectionTitle}>Our products</div>

                <div className={styles.gridWrapper}>
                    {images.map((item, idx) => (
                        <div className={styles.gridItem} key={idx}>
                            <Link href={item.href} className={styles.cardLink}>
                                <div className={styles.cardRatio}>
                                    <CategoryCard
                                        src={item.src}
                                        alt={item.alt}
                                        title={item.title}
                                    />
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
            </OutlineBox>
        </section>
    );
}
