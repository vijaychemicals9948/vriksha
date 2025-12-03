"use client";
import React from "react";
import OutlineBox3 from "./OutlineBox3";
import CategoryCard from "./CategoryCard";
import styles from "./CategoriesSection.module.css";

const images = [
    { src: "/homepage/categories/1.jpg", alt: "Category 1", title: "Category 1" },
    { src: "/homepage/categories/2.jpg", alt: "Category 2", title: "Category 2" },
    { src: "/homepage/categories/3.jpg", alt: "Category 3", title: "Category 3" },
    { src: "/homepage/categories/4.jpg", alt: "Category 4", title: "Category 4" },
    { src: "/homepage/categories/5.jpg", alt: "Category 5", title: "Category 5" },
    { src: "/homepage/categories/6.jpg", alt: "Category 6", title: "Category 6" },
    { src: "/homepage/categories/7.jpg", alt: "Category 7", title: "Category 7" },
    { src: "/homepage/categories/8.jpg", alt: "Category 8", title: "Category 8" },
];

export default function CategoriesSection() {
    const firstSix = images.slice(0, 6);
    const lastTwo = images.slice(6);

    return (
        <section className={styles.pageWrapper}>
            <OutlineBox3>
                

                <div className={styles.gridWrapper}>
                    {firstSix.map((item, idx) => (
                        <div className={styles.gridItem} key={idx}>
                            <div className={styles.cardRatio}>
                                <CategoryCard src={item.src} alt={item.alt} title={item.title} />
                            </div>
                        </div>
                    ))}

                    <div className={styles.gridItemFull}>
                        <div className={styles.centerPair}>
                            {lastTwo.map((item, idx) => (
                                <div className={styles.pairItem} key={`last-${idx}`}>
                                    <div className={styles.cardRatio}>
                                        <CategoryCard src={item.src} alt={item.alt} title={item.title} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </OutlineBox3>
        </section>
    );
}
