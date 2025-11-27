"use client";
import React, { useState } from "react";
import Link from "next/link";
import styles from "./products.module.css";

interface ProductItem {
    title: string;
    children?: ProductItem[];
}

interface ProductAccordionProps {
    items: ProductItem[];
}

export default function ProductAccordion({ items }: ProductAccordionProps) {
    const [openIndex, setOpenIndex] = useState<number | null>(6);

    const toggle = (i: number) => {
        setOpenIndex(openIndex === i ? null : i);
    };

    // Slug (URL friendly text) convert function
    const slugify = (text: string) =>
        text.toLowerCase().replace(/\s+/g, "-");

    return (
        <ul className={styles.productList}>
            {items.map((item: ProductItem, i: number) => (
                <li key={i} className={styles.categoryItem}>

                    <div
                        className={styles.categoryRow}
                        onClick={() => item.children && toggle(i)}
                    >

                        {/* If no children -> Direct Link */}
                        {!item.children ? (
                            <Link
                                href={`/products/${slugify(item.title)}`}
                                className={styles.link}
                            >
                                {item.title}
                            </Link>

                        ) : (
                            <span>{item.title}</span>
                        )}

                        {item.children && (
                            <span className={styles.arrow}>
                                {openIndex === i ? "−" : "+"}
                            </span>
                        )}
                    </div>

                    {/* Subcategories */}
                    {item.children && (
                        <ul
                            className={`${styles.subList} ${openIndex === i ? styles.open : ""
                                }`}
                        >
                            {item.children.map((sub: ProductItem, j: number) => (
                                <li key={j}>
                                    <Link
                                        href={`/products/${slugify(sub.title)}`}
                                        className={styles.link}
                                    >
                                        {sub.title}
                                    </Link>

                                </li>
                            ))}
                        </ul>
                    )}
                </li>
            ))}
        </ul>
    );
}
