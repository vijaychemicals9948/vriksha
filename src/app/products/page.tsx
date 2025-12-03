//products/page.tsx

"use client";

import Image from "next/image";
import styles from "./products.module.css";
import ProductAccordion from "./ProductAccordion";
import { productsData } from "@/data/productsData";
import { useRef, useEffect } from "react";

export default function ProductsPage() {

    const containerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        function updateLeftLine() {
            const container = containerRef.current;
            if (!container) return;

            const leftCol = container.querySelector(`.${styles.left}`) as HTMLElement | null;
            const imageWrap = leftCol?.querySelector(`.${styles.imageWrap}`) as HTMLElement | null;

            const containerHeight = container.clientHeight;

            if (imageWrap) {
                const imgTop = imageWrap.offsetTop; // distance from top of container
                const imgH = imageWrap.clientHeight;
                const imgCenter = imgTop + Math.round(imgH / 2);

                // make the cut height proportional to the image height (tweak multiplier as needed)
                const cutHeight = Math.round(imgH * 0.4); // 40% of image height as cut gap
                const cutTop = Math.max(0, Math.round(imgCenter - cutHeight / 2));
                const cutBottomHeight = Math.max(0, containerHeight - (cutTop + cutHeight));

                // set CSS variables so CSS can position the two left-border segments
                container.style.setProperty("--left-border-top-height", `${cutTop}px`);
                container.style.setProperty("--left-border-bottom-height", `${cutBottomHeight}px`);

                // optional: set left-line-top variable used earlier (if you still need it)
                const start = imgTop + Math.round(imgH / 2);
                container.style.setProperty("--left-line-top", `${start}px`);
            } else {
                // defaults if image not found
                container.style.setProperty("--left-border-top-height", `120px`);
                container.style.setProperty("--left-border-bottom-height", `120px`);
                container.style.setProperty("--left-line-top", `120px`);
            }
        }

        updateLeftLine();
        window.addEventListener("resize", updateLeftLine);
        return () => window.removeEventListener("resize", updateLeftLine);
    }, []);

    return (
        <main ref={containerRef} className={styles.container}>
            {/* left border is split into two spans so we can "cut" the middle */}
            <span className={styles.leftBorderTop} aria-hidden />
            <span className={styles.leftBorderBottom} aria-hidden />

            <aside className={styles.left}>
                <h2 className={styles.title}>Our Products</h2>

                <div className={styles.imageWrap}>
                    <Image
                        src="/products-page/products.png"
                        alt="Our products"
                        width={520}
                        height={520}
                        className={styles.image}
                        priority
                    />
                </div>
            </aside>

            <section className={styles.right}>
                <ProductAccordion items={productsData} />
            </section>
        </main>
    );
}
