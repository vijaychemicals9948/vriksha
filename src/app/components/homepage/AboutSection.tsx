"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import styles from "./AboutSection.module.css";

export default function AboutSection() {
    const rootRef = useRef<HTMLElement | null>(null);
    const [inView, setInView] = useState(false);

    useEffect(() => {
        if (typeof window === "undefined") return;
        if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            setInView(true);
            return;
        }

        const el = rootRef.current;
        if (!el) return;

        let observer: IntersectionObserver | null = null;
        if ("IntersectionObserver" in window) {
            observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            setInView(true);
                            if (observer && el) observer.unobserve(el); // animate once
                        }
                    });
                },
                { root: null, rootMargin: "0px 0px -10% 0px", threshold: 0.15 }
            );
            observer.observe(el);
        } else {
            setInView(true);
        }

        return () => {
            if (observer && el) observer.unobserve(el);
        };
    }, []);

    return (
        <section ref={rootRef} className={styles.wrapper}>
            <div className={`${styles.container} ${inView ? styles.inView : ""}`}>
                {/* frame lines (animated) */}
                <span className={`${styles.frameLine} ${styles.lineTop}`} aria-hidden />
                <span className={`${styles.frameLine} ${styles.lineBottom}`} aria-hidden />
                <span className={`${styles.frameLine} ${styles.lineLeft}`} aria-hidden />
                <span className={`${styles.frameLine} ${styles.lineRight}`} aria-hidden />

                <div className={`${styles.inner}`}>
                    {/* Left Image */}
                    <div className={`${styles.imageBox}`}>
                        <Image
                            src="/images/prabhavali.jpg"
                            alt="Indian gods on prabhavali and silk"
                            width={900}
                            height={420}
                            className={styles.image}
                            priority={false}
                        />
                    </div>

                    {/* Right Text */}
                    <div className={`${styles.textBox}`}>
                        <h2 className={styles.title}>Indian gods on prabhavali & silk</h2>

                        <p className={styles.text}>
                            Digitally printed Indian gods embellished with brass prabhavali in the
                            backdrop of rich raw silk.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
