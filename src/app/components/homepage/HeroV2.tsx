"use client";

import { useState } from "react";
import styles from "./HeroSection.module.css";

const images = ["/images/bg-red2.jpg"];

export default function HeroSection() {
    const [index] = useState(0);

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

            {/* TEXT OVERLAY */}
            {/*<div className={styles.textBox}>
                <h1>
                    Timeless brass,<br />
                    draped in the<br />
                    richness of silk
                </h1>
            </div> */}
        </section>
    );
}
