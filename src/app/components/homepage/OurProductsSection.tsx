"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./OurProductsSection.module.css";
import OutlineBox from "./OutlineBox2";
import { productsData } from "@/data/productsData"; // <- added import
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
    const wrapperRef = useRef<HTMLDivElement | null>(null); // element we will transform
    const rafRef = useRef<number | null>(null);
    const changeTimerRef = useRef<number | null>(null);

    const target = useRef({ x: 0, y: 0 });
    const current = useRef({ x: 0, y: 0 });

    const [enabled, setEnabled] = useState<boolean>(true);

    // subtle maximum translation in px
    const MAX_TRANSLATE = 10; // kept small for a very light feel

    // Enable animation only on larger viewports (you already used 900px)
    useEffect(() => {
        const updateEnabled = () => setEnabled(window.innerWidth > 900);
        updateEnabled();
        window.addEventListener("resize", updateEnabled);
        return () => window.removeEventListener("resize", updateEnabled);
    }, []);

    // Pick a new random target (within -1..1 normalized range) and schedule next pick
    const pickNewTarget = () => {
        const nx = (Math.random() * 2 - 1) * 0.6;
        const ny = (Math.random() * 2 - 1) * 0.45;
        target.current.x = nx * MAX_TRANSLATE;
        target.current.y = ny * MAX_TRANSLATE;

        const next = 500 + Math.random() * 1500;
        changeTimerRef.current = window.setTimeout(pickNewTarget, next) as unknown as number;
    };

    // RAF smoothing animation with tiny sine wobble
    useEffect(() => {
        let t = 0;
        const animate = () => {
            const ease = 0.08;
            current.current.x += (target.current.x - current.current.x) * ease;
            current.current.y += (target.current.y - current.current.y) * ease;

            t += 0.016;
            const wobbleX = Math.sin(t * 0.9) * 0.6;
            const wobbleY = Math.sin(t * 1.3) * 0.4;

            if (wrapperRef.current && enabled) {
                wrapperRef.current.style.transform = `translate3d(${(current.current.x + wobbleX).toFixed(3)}px, ${(current.current.y + wobbleY).toFixed(3)}px, 0)`;
            } else if (wrapperRef.current) {
                wrapperRef.current.style.transform = `none`;
            }

            rafRef.current = requestAnimationFrame(animate);
        };

        rafRef.current = requestAnimationFrame(animate);
        if (enabled) {
            pickNewTarget();
        } else {
            target.current.x = 0;
            target.current.y = 0;
        }

        return () => {
            if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
            if (changeTimerRef.current !== null) clearTimeout(changeTimerRef.current);
            rafRef.current = null;
            changeTimerRef.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [enabled]);

    // Ensure if animation disabled we reset positions
    useEffect(() => {
        if (!enabled) {
            target.current.x = 0;
            target.current.y = 0;
            current.current.x = 0;
            current.current.y = 0;
            if (wrapperRef.current) wrapperRef.current.style.transform = "none";
        }
    }, [enabled]);

    // Recursive renderer to output the same structure (top-level li and nested ul for children)
    const renderItems = (items: ProductItem[]) => {
        return items.map((it, idx) => {
            const slug = slugify(it.title);
            return (
                <li key={idx}>
                    {/* NO <a> inside Link (new Next.js) */}
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

                        <div className={styles.imageOuter} ref={wrapperRef}>
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
