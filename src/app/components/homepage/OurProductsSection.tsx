"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./OurProductsSection.module.css";
import OutlineBox from "./OutlineBox2";
import { productsData } from "@/data/productsData"; // <- kept
import OutlineBoxVertical from "./OutlineBoxVertical";

// re-use a simple ProductItem type for TS clarity
interface ProductItem {
    title: string;
    children?: ProductItem[];
}

/** Basic slugify: lowercase, trim, remove non-word chars, spaces -> dashes */
const slugify = (s: string) =>
    s
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "") // remove punctuation (keeps word chars, spaces, hyphens)
        .replace(/\s+/g, "-"); // spaces -> hyphens

export default function OurProductsSection() {
    // Recursive renderer to output the same structure (top-level li and nested ul for children)
    const renderItems = (items: ProductItem[]) => {
        return items.map((it, idx) => {
            const slug = slugify(it.title);
            return (
                <li key={idx}>
                    <Link href={`/products/${slug}`} className={styles.productLink}>
                        {it.title}
                    </Link>

                    {it.children && it.children.length > 0 && (
                        <ul>
                            {it.children.map((child, cidx) => {
                                const childSlug = slugify(child.title);
                                return (
                                    <li key={cidx}>
                                        <Link href={`/products/${childSlug}`} className={styles.productLink}>
                                            {child.title}
                                        </Link>

                                        {child.children && child.children.length > 0 && (
                                            <ul>
                                                {child.children.map((gc, gidx) => {
                                                    const gcSlug = slugify(gc.title);
                                                    return (
                                                        <li key={gidx}>
                                                            <Link href={`/products/${gcSlug}`} className={styles.productLink}>
                                                                {gc.title}
                                                            </Link>
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </li>
            );
        });
    };

    return (
        <section
            className={styles.wrapper}
            aria-labelledby="our-products-title"
        >
            <OutlineBox>
                <div className={styles.container}>
                    <div className={styles.left}>
                        <h2 id="our-products-title" className={styles.title}>
                            Our products
                        </h2>

                        {/* Static image wrapper (no animation) */}
                        <div className={styles.imageOuter}>
                            <div className={styles.imageBox}>
                                <Image
                                    src="/homepage/our-products.jpg"
                                    alt="Our products"
                                    fill
                                    sizes="(max-width: 768px) 100vw, 100vw"
                                    style={{ objectFit: "cover" }}
                                    priority
                                />
                            </div>
                        </div>
                    </div>

                    <div className={styles.right}>
                        <ul className={styles.catList}>
                            {renderItems(productsData as ProductItem[])}
                        </ul>
                    </div>

                    <OutlineBoxVertical className={styles.verticalBoxProduct} />
                </div>
            </OutlineBox>
        </section>
    );
}
