"use client";

import { useEffect, useState } from "react";
import styles from "./HeroCover.module.css";

export default function HeroCover({ src }: { src: string }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const t = requestAnimationFrame(() => setMounted(true));
        return () => cancelAnimationFrame(t);
    }, []);

    return (
        <div className={styles.heroSection}>
            <img
                src={src}
                className={`${styles.heroImage} ${mounted ? styles.heroImageEnter : ""}`}
            />
        </div>
    );
}
