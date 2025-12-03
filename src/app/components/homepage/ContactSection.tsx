// File: ContactSection.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import styles from "./ContactSection.module.css";
import OutlineBox from "./OutlineBox";

export default function ContactSection() {
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

    // OPTIONAL: example inline style showing how to tweak the offsets.
    // You can remove the `style={...}` prop below or change the values (-80px, -40px) to suit.
    const containerStyle: React.CSSProperties = {
        // CSS variables exposed to the stylesheet:
        // --logo-offset-x : how far from the right edge (positive values move it inward less)
        // --logo-offset-y : how far from the bottom edge
        // negative values pull the logo more into the viewport.
        ["--logo-offset-x" as any]: "-80px",
        ["--logo-offset-y" as any]: "-40px",
    };

    return (
        <section className={styles.wrapper} aria-labelledby="our-story-title">
            {/* Background logo (positioned absolute in the wrapper) */}
            {/* It's placed before the OutlineBox so it sits behind content (lower z-index) */}
            <img
                src="/homepage/logo.png"
                alt=""
                aria-hidden="true"
                className={styles.bgLogo}
            />

            <OutlineBox>
                <div className={styles.container} style={containerStyle}>
                    <div className={styles.left}>
                        <h2 id="our-story-title" className={styles.title}>
                            Contact
                        </h2>

                        {/* transform applied to this outer wrapper (moves with global mouse) */}
                        <div className={styles.imageOuter} ref={wrapperRef}>
                            <div className={styles.imageBox}>
                                <Image
                                    src="/homepage/contact-image.png"
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
                        <div>
                            {/* Logo */}
                            <div className={styles.logoBox}>
                                <Image
                                    src="/homepage/vriksha-logo.svg"
                                    alt="Vriksha Logo"
                                    width={160}
                                    height={130}
                                    className={styles.logo}
                                />
                                <div className={styles.brandLine}>Indian Home Decor Studio</div>
                            </div>

                            {/* Contact Names */}
                            <div className={styles.personLine}>
                                Vasumathi Ramesh: 9940419286
                                Ramesh Kannan: 9444403249
                            </div>

                            <div className={styles.space} />

                            {/* Address */}
                            <div className={styles.address}>
                                1B, Prince Arcade, 22A, Cathedral Road<br />
                                Chennai 600086
                            </div>

                            <div className={styles.space} />

                            {/* Email + Website */}
                            <div className={styles.infoLine}>vrikshaa@gmail.com</div>
                            <div className={styles.infoLine}>www.vriksha.co.in</div>

                            <div className={styles.space} />

                            {/* Social Links */}
                            <div className={styles.socialLinks}>
                                https://www.facebook.com/
                                VrikshaAPresentationPort/
                            </div>

                            <div className={styles.socialLinks}>
                                https://www.instagram.com/
                                vrikshapresentationport/
                            </div>
                        </div>
                    </div>
                </div>
            </OutlineBox>
        </section>
    );
}
