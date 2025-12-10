"use client";
import React from "react";
import OutlineBox from "./OutlineBox3";
import CategoryCard from "./CategoryCard";
import styles from "./CategoriesSection.module.css";

const images = [
    { src: "/homepage/categories/11.jpg", alt: "Category 1", title: "Category 1" },
    { src: "/homepage/categories/12.jpg", alt: "Category 2", title: "Category 2" },
    { src: "/homepage/categories/13.jpg", alt: "Category 3", title: "Category 3" },
    { src: "/homepage/categories/14.jpg", alt: "Category 4", title: "Category 4" },
    { src: "/homepage/categories/15.jpg", alt: "Category 5", title: "Category 5" },
    { src: "/homepage/categories/16.jpg", alt: "Category 6", title: "Category 6" },
    { src: "/homepage/categories/17.jpg", alt: "Category 7", title: "Category 7" },
    { src: "/homepage/categories/18.jpg", alt: "Category 8", title: "Category 8" },
];

export default function CategoriesSection() {
    return (
        <section className={styles.pageWrapper}>
            <OutlineBox>
                {/* Title inside the OutlineBox — adjust top/left in CSS */}
                <div className={styles.sectionTitle}>Our products</div>

                <div className={styles.gridWrapper}>
                    {images.map((item, idx) => (
                        <div className={styles.gridItem} key={idx}>
                            <div className={styles.cardRatio}>
                                <CategoryCard src={item.src} alt={item.alt} title={item.title} />
                            </div>
                        </div>
                    ))}
                </div>
            </OutlineBox>
        </section>
    );
}
