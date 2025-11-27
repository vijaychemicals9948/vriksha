"use client";

import { useEffect, useState } from "react";
import styles from "./HeroSection.module.css";

const images = [
    "/homepage/hero1.png",
    "/homepage/hero2.png",
    "/homepage/hero3.png",
    "/homepage/hero6.png",
];

export default function HeroSection() {
    const [index, setIndex] = useState(0);

    // Auto-slide every 4 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setIndex(i => (i + 1) % images.length);
        }, 4000);

        return () => clearInterval(interval);
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

            {/* Dark overlay */}
            <div className={styles.overlay}></div>

            {/* Dots navigation */}
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
