"use client";

import { useEffect, useState } from "react";
import styles from "./HeroSection.module.css";

const images = [
    "/homepage/final1.png",
    "/homepage/final2.png",
    "/homepage/final4.png",
    "/homepage/hero7.webp",
    "/homepage/hero8.webp",
];

export default function HeroSection() {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        // 1) First slide changes quickly after 2 seconds
        const firstTimeout = setTimeout(() => {
            setIndex(i => (i + 1) % images.length);

            // 2) After first change, start regular 4-sec interval
            const interval = setInterval(() => {
                setIndex(i => (i + 1) % images.length);
            }, 4000);

            // Cleanup interval only
            return () => clearInterval(interval);
        }, 2000);

        // Cleanup timeout when component unmounts
        return () => clearTimeout(firstTimeout);
    }, []);

    return (
        <section className={styles.hero}>
            {images.map((src, i) => (
                <div
                    key={src}
                    className={`${styles.slide} ${i === index ? styles.active : ""}`}
                    style={{ backgroundImage: `url(${src})` }}
                />
            ))}

            <div className={styles.overlay}></div>

            <div className={styles.dots}>
                {images.map((_, i) => (
                    <div
                        key={i}
                        className={`${styles.dot} ${i === index ? styles.activeDot : ""}`}
                        onClick={() => setIndex(i)}
                    ></div>
                ))}
            </div>
        </section>
    );
}
