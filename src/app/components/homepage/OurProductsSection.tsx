"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./OurProductsSection.module.css";
import OutlineBox from "./OutlineBox2";

/** Data structure */
interface ProductCategory {
    title: string;
    href: string;
    children?: ProductCategory[];
}

/** MANUAL PRODUCT LIST */
const PRODUCT_LIST: ProductCategory[] = [
    {
        title: "Brass idols on silk",
        href: "/products/brass-idols-on-silk",
    },
    {
        title: "Brass idols on silk & gold",
        href: "/products/brass-idols-on-gold-metal-art",
    },
    {
        title: "Brass idols on solid wood",
        href: "/products/brass-on-solid-wood",
    },
    {
        title: "Gold coated metal art",
        href: "/products/gold-metal-art",
    },
    {
        title: "Serving trays with gold metal art",
        href: "/products/serving-trays",
    },
    {
        title: "Pooja room series",
        href: "/products/pooja-room-series",
        children: [
            {
                title: "Miniature gods on silk",
                href: "/products/pooja-room-series/miniature-gods",
            },
            {
                title: "Various gods series",
                href: "/products/pooja-room-series/various-gods-series",
            },
            {
                title: "Gods on gold coated metal art",
                href: "/products/pooja-room-series/gods-on-gold-metal",
            },
            {
                title: "Ashtalakshmi series",
                href: "/products/pooja-room-series/ashtalakshmi-series",
            },
            {
                title: "Dasavatar series",
                href: "/products/pooja-room-series/dasavatar",
            },
            {
                title: "Arupadai veedu series",
                href: "/products/pooja-room-series/arupadai-veedu",
            },
            {
                title: "Gods on solid wood",
                href: "/products/pooja-room-series/gods-on-solid-wood",
            },
        ],
    },
    {
        title: "Prabhavali series",
        href: "/products/indian-art-on-prabhavali",
        children: [
            {
                title: "Indian art on prabhavali",
                href: "/products/indian-art-on-prabhavali/indianart-on-prabhavali",
            },
            {
                title: "Indian gods on prabhavali",
                href: "/products/indian-art-on-prabhavali/gods-on-prabhavali",
            },
            {
                title: "Indian gods with gold on prabhavali",
                href: "/products/indian-art-on-prabhavali/gods-on-prabhavali",
            },
        ],
    },
    {
        title: "Exquisite custom made mementos",
        href: "/products/mementos",
        children: [
            {
                title: "Theme based – Personal / Corporate",
                href: "/products/mementos",
            },
        ],
    },
];

export default function OurProductsSection() {
    return (
        <section className={styles.wrapper} aria-labelledby="our-products-title">
            <OutlineBox delay={600}>
                <div className={styles.container}>
                    {/* LEFT */}
                    <div className={styles.left}>
                        <h2 id="our-products-title" className={styles.title}>
                            Our products
                        </h2>

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

                    {/* RIGHT */}
                    <div className={styles.right}>
                        <ul className={styles.catList}>
                            {PRODUCT_LIST.map((cat) => (
                                <li key={cat.href}>
                                    <Link
                                        href={cat.href}
                                        className={styles.productLink}
                                    >
                                        {cat.title}
                                    </Link>

                                    {cat.children && (
                                        <ul>
                                            {cat.children.map((sub, index) => (
                                                <li key={`${sub.href}-${index}`}>
                                                    <Link
                                                        href={sub.href}
                                                        className={styles.productLink}
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
                    </div>
                </div>
            </OutlineBox>
        </section>
    );
}
