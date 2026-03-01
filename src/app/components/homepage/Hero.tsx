"use client";

import { useEffect, useState } from "react";
import styles from "./HeroSection.module.css";

/* Desktop banners */
const desktopImages = [
    "/homepage/final1.png",
    "/homepage/final2.png",
    "/homepage/final4.png",
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

    /* slider only for desktop (mobile me ek hi image hai) */
    useEffect(() => {
        if (images.length <= 1) return;

        const firstTimeout = setTimeout(() => {
            setIndex(i => (i + 1) % images.length);

            const interval = setInterval(() => {
                setIndex(i => (i + 1) % images.length);
            }, 4000);

            return () => clearInterval(interval);
        }, 2000);

        return () => clearTimeout(firstTimeout);
    }, [images]);

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

            {/* dots sirf desktop pe */}
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
