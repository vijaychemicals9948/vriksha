//src/app/components/products/HeroCover.tsx
"use client";

import { useEffect, useState } from "react";
import styles from "./HeroCover.module.css";

export default function HeroCover({
  desktopSrc,
  mobileSrc,
}: {
  desktopSrc: string;
  mobileSrc?: string;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(t);
  }, []);

  return (
    <div className={styles.heroSection}>
      <picture>
        {/* Mobile Image */}
        {mobileSrc && (
          <source media="(max-width: 768px)" srcSet={mobileSrc} />
        )}

        {/* Desktop Image */}
        <img
          src={desktopSrc}
          className={`${styles.heroImage} ${
            mounted ? styles.heroImageEnter : ""
          }`}
          alt="Category Banner"
        />
      </picture>
    </div>
  );
}
