"use client";

import { useState, useEffect } from "react";
import styles from "./HeroSection.module.css";

const images = [
    "/images/gold-coated-metal.jpg",
    "/images/living-room.jpg",
    "/images/pichwai.jpg",
    "/images/brass-on-silk.jpg"
];

export default function HeroSection() {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((i) => (i + 1) % images.length);
        }, 12000); // change every 4s
        return () => clearInterval(interval);
    }, []);

    return (
        <section className={styles.hero}>
            {images.map((src, i) => (
                <div
                    key={src}
                    className={`${styles.slide} ${i === index ? styles.active : ""}`}
                    style={{ backgroundImage: `url(${src})` }}
                ></div>
            ))}

            {/* Dark overlay */}
            <div className={styles.overlay}></div>
        </section>
    );
}
