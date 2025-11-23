"use client";
import React, { useEffect, useRef, useState } from "react";
import styles from "./Navbar.module.css";
import Link from "next/link";
import Image from "next/image";
import Hamburger from "./Hamburger";

export default function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);

    // --- Scroll show/hide behaviour (isolated inside Navbar) ---
    const [translateY, setTranslateY] = useState(0);
    const [transition, setTransition] = useState("transform 0s");
    const [elevated, setElevated] = useState(true); // controls shadow intensity
    const NAV_HEIGHT = 120;
    const lastScrollYRef = useRef(0);
    const rafRef = useRef<number | null>(null);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            const delta = currentScrollY - lastScrollYRef.current;

            if (currentScrollY <= 10) {
                // At top: keep navbar visible and solid (user wanted non-transparent by default)
                setTranslateY(0);
                setTransition("transform 0s");
                setElevated(false); // less shadow at very top
            } else if (delta > 0) {
                // Scrolling down -> hide smoothly
                setElevated(true);
                setTransition("transform 0.45s cubic-bezier(.2,.9,.2,1)");
                setTranslateY(-NAV_HEIGHT);
           

            } else if (delta < 0) {
                // Scrolling up -> reveal
                setElevated(true);
                const startTransform = Math.max(-NAV_HEIGHT, -currentScrollY);
                setTranslateY(startTransform);
                setTransition("transform 0s");
                if (rafRef.current) cancelAnimationFrame(rafRef.current);
                rafRef.current = requestAnimationFrame(() => {
                    setTransition("transform 0.45s cubic-bezier(.2,.9,.2,1)");
                    setTranslateY(0);
                });
            }

            lastScrollYRef.current = currentScrollY;
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        handleScroll();
        return () => {
            window.removeEventListener("scroll", handleScroll);
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, []);

    // Choose a brand color or neutral — change to your brand color if you have one
    const BG_COLOR = "255, 250, 246"; // a warm off-white (use `R,G,B`)
    const SHADOW_ALPHA = elevated ? 0.12 : 0.04;

    return (
        <nav
            className={styles.navbar}
            style={{
                transform: `translateY(${translateY}px)`,
                transition: `${transition}, box-shadow 350ms ease-in-out, background-color 350ms ease-in-out`,
                backgroundColor: `rgba(${BG_COLOR}, 1)`, // always solid by default per your request
                boxShadow: `0 6px 20px rgba(0,0,0,${SHADOW_ALPHA})`,
                backdropFilter: "saturate(120%) blur(2px)",
            }}
        >
            <div className={styles.container}>
                {/* LEFT: Hamburger */}
                <div className={styles.left}>
                    <Hamburger open={menuOpen} setOpen={setMenuOpen} />
                </div>

                {/* CENTER: Logo */}
                <div className={styles.logo}>
                    <Link href="/" aria-label="Go to homepage">
                        {/* Using uploaded image path from your session (replace with /public/VRIKSHA-LOGO1.svg if preferred) */}
                        <Image
                            src="/VRIKSHA-LOGO2.svg"
                            alt="Vriksha Logo"
                            width={220}
                            height={56}
                            priority
                        />
                    </Link>
                </div>

                {/* Right placeholder — add links or buttons here in future */}
                <div className={styles.right} aria-hidden />
            </div>
        </nav>
    );
}
