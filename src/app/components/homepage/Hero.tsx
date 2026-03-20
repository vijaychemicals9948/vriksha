"use client";

import { useEffect, useState } from "react";
import styles from "./HeroSection.module.css";

/* Desktop banners */
const desktopImages = [
    "/homepage/final1.webp",
    "/homepage/final2.webp",
    "/homepage/final4.webp",
    "/homepage/hero7.webp",
    "/homepage/hero8.webp",
];

/* Mobile banners */
const mobileImages = [
    "/homepage/mobile/brass-decor-mobile-version.webp",
    "/homepage/mobile/prabhavali.webp",
    "/homepage/mobile/gold-metal-mobile-version.webp",
    "/homepage/mobile/mementos.webp",
    "/homepage/mobile/gold-metal-brass.webp",
];

export default function HeroSection() {
    const [index, setIndex] = useState(0);
    const [isMobile, setIsMobile] = useState(false);

    const images = isMobile ? mobileImages : desktopImages;

    /* detect mobile */
    useEffect(() => {
        const checkDevice = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        checkDevice();
        window.addEventListener("resize", checkDevice);

        return () => window.removeEventListener("resize", checkDevice);
    }, []);

    /* slider logic (fixed interval + timeout) */
    useEffect(() => {
        if (images.length <= 1) return;

        let interval: ReturnType<typeof setInterval>;

        const timeout = setTimeout(() => {
            setIndex((i) => (i + 1) % images.length);

            interval = setInterval(() => {
                setIndex((i) => (i + 1) % images.length);
            }, 4000);
        }, 2000);

        return () => {
            clearTimeout(timeout);
            if (interval) clearInterval(interval);
        };
    }, [images]);

    /* 🔥 preload NEXT image */
    useEffect(() => {
        if (images.length <= 1) return;

        const nextIndex = (index + 1) % images.length;
        const img = new Image();
        img.src = images[nextIndex];
    }, [index, images]);

    return (
        <section className={styles.hero}>
            {images.map((src, i) => (
                <div
                    key={src}
                    className={`${styles.slide} ${i === index ? styles.active : ""}`}
                    style={{ backgroundImage: `url(${src})` }}
                />
            ))}

            <div className={styles.overlay} />

            {/* dots */}
            {images.length > 1 && (
                <div className={styles.dots}>
                    {images.map((_, i) => (
                        <div
                            key={i}
                            className={`${styles.dot} ${i === index ? styles.activeDot : ""}`}
                            onClick={() => setIndex(i)}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}