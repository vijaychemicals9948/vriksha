"use client";
import React, { useEffect, useRef, useState } from "react";
import styles from "./Navbar.module.css";
import Link from "next/link";
import Image from "next/image";
import Hamburger from "./Hamburger";

export default function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);

    // --- Scroll show/hide behaviour (KEEP this inside Navbar so it's isolated) ---
    const [bgOpacity, setBgOpacity] = useState(0);
    const [transform, setTransform] = useState(0);
    const [transition, setTransition] = useState("transform 0s");
    const NAV_HEIGHT = 150;
    const lastScrollYRef = useRef(0);
    const rafRef = useRef<number | null>(null);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            const delta = currentScrollY - lastScrollYRef.current;

            if (currentScrollY < 10) {
                setTransform(0);
                setTransition("transform 0s");
                setBgOpacity(0);
            } else if (delta > 0) {
                setTransition("transform 0s");
                setTransform(-NAV_HEIGHT);
            } else if (delta < 0) {
                setBgOpacity(1);
                const startTransform = Math.max(-NAV_HEIGHT, -currentScrollY);
                setTransform(startTransform);
                setTransition("transform 0s");
                if (rafRef.current) cancelAnimationFrame(rafRef.current);
                rafRef.current = requestAnimationFrame(() => {
                    setTransition("transform 0.45s cubic-bezier(.2,.9,.2,1)");
                    setTransform(0);
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

    return (
        <nav
            className={styles.navbar}
            style={{
                transform: `translateY(${transform}px)`,
                transition: `${transition}, background-color 350ms ease-in-out, box-shadow 350ms ease-in-out`,
                backgroundColor: `rgba(255,255,255,${bgOpacity})`,
                boxShadow: `0 2px 10px rgba(0,0,0,${0.1 * bgOpacity})`,
            }}
        >
            <div className={styles.container}>
                {/* LEFT: Logo now here */}
                <div className={styles.logo}>
                    <Link href="/" aria-label="Go to homepage">
                        <Image src="/logo-white.png" alt="Vriksha Logo" width={130} height={104} priority />
                    </Link>
                </div>

                {/* RIGHT: Hamburger now here */}
                <div className={styles.right}>
                    <Hamburger open={menuOpen} setOpen={setMenuOpen} />
                </div>
            </div>

            
        </nav>
    );
}
