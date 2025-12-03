// File: OurStorySection.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import styles from "./OurStorySection.module.css";
import OutlineBox from "./OutlineBox";
import OutlineBoxVertical from "./OutlineBoxVertical";


export default function OurStorySection() {
    const wrapperRef = useRef<HTMLDivElement | null>(null); // the element we will transform
    const rafRef = useRef<number | null>(null);

    const target = useRef({ x: 0, y: 0 });
    const current = useRef({ x: 0, y: 0 });

    const [enabled, setEnabled] = useState<boolean>(false);

    // subtle maximum translation in px
    const MAX_TRANSLATE = 14;

    // enable only on larger viewports
    useEffect(() => {
        const updateEnabled = () => setEnabled(window.innerWidth > 900);
        updateEnabled();
        window.addEventListener("resize", updateEnabled);
        return () => window.removeEventListener("resize", updateEnabled);
    }, []);

    // RAF smoothing animation
    useEffect(() => {
        const animate = () => {
            const ease = 0.12;
            current.current.x += (target.current.x - current.current.x) * ease;
            current.current.y += (target.current.y - current.current.y) * ease;

            if (wrapperRef.current) {
                wrapperRef.current.style.transform = `translate3d(${current.current.x}px, ${current.current.y}px, 0)`;
            }

            rafRef.current = requestAnimationFrame(animate);
        };

        rafRef.current = requestAnimationFrame(animate);
        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, []);

    // Use global mouse position (relative to viewport center)
    useEffect(() => {
        if (!enabled) return;

        const handleGlobalMove = (e: MouseEvent) => {
            // normalized -0.5 .. 0.5 across the viewport
            const nx = e.clientX / window.innerWidth - 0.5;
            const ny = e.clientY / window.innerHeight - 0.5;

            // invert Y slightly for more natural parallax
            target.current.x = nx * MAX_TRANSLATE;
            target.current.y = -ny * MAX_TRANSLATE;
        };

        const handleLeaveWindow = () => {
            target.current.x = 0;
            target.current.y = 0;
        };

        window.addEventListener("mousemove", handleGlobalMove, { passive: true });
        window.addEventListener("mouseout", handleLeaveWindow);
        window.addEventListener("mouseleave", handleLeaveWindow);

        return () => {
            window.removeEventListener("mousemove", handleGlobalMove);
            window.removeEventListener("mouseout", handleLeaveWindow);
            window.removeEventListener("mouseleave", handleLeaveWindow);
        };
    }, [enabled]);

    // When effect is disabled (small screens), ensure target resets
    useEffect(() => {
        if (!enabled) {
            target.current.x = 0;
            target.current.y = 0;
        }
    }, [enabled]);

    return (
        <section className={styles.wrapper} aria-labelledby="our-story-title">
            <OutlineBox>
                <div className={styles.container}>
                    <div className={styles.left}>
                        <Image
                            src="/homepage/logo2.png"
                            alt="Vriksha Logo"
                            width={120}
                            height={120}
                            className={styles.logo}
                        />

                        <h2 id="our-story-title" className={styles.title}>
                            Our story
                        </h2>

                        {/* transform applied to this outer wrapper (moves with global mouse) */}
                        <div className={styles.imageOuter} ref={wrapperRef}>
                            <div className={styles.imageBox}>
                                <Image
                                    src="/homepage/office1.png"
                                    alt="Vriksha studio office"
                                    fill
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                    style={{ objectFit: "cover" }}
                                    priority
                                />
                            </div>
                        </div>
                    </div>

                    <div className={styles.right}>
                        <p>
                            Vriksha is a boutique creative studio born from the shared passion
                            of husband-and-wife duo Vasumathi and Ramesh Kannan. What began as
                            a small dream has grown into a space where art, storytelling, and
                            craftsmanship come together.
                        </p>

                        <p>
                            At the heart of Vriksha is Vasumathi, the artist whose hands and
                            imagination shape every beautiful piece. Her work blends
                            sensitivity, detail, and a deep love for artistry. Complementing
                            her is Ramesh, the creative mind and copywriter who brings ideas
                            to life with thoughtful concepts and expressive words.
                        </p>

                        <p>
                            Together, they create a wide range of bespoke home décor products,
                            each crafted with intention and care. Vriksha also specialises in
                            customised mementos, personalised cards, and keepsakes for
                            weddings, special occasions, and celebrations of every kind —
                            pieces designed to be cherished for years.
                        </p>

                        <p>
                            At Vriksha, every creation has a story, a soul, and a touch of the
                            personal. It’s not just a studio — it’s a celebration of
                            creativity, collaboration, and meaningful craftsmanship.
                        </p>
                    </div>
                </div>
            </OutlineBox>
            <OutlineBoxVertical className={styles.verticalBox} />
        </section>
        
    );
}
