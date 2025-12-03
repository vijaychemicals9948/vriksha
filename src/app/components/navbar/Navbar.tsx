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
            const current = window.scrollY;
            const delta = current - lastScrollYRef.current;

            // transparent at top
            if (current < 10) {
                setBgOpacity(0);
                setTransform(0);
            }

            // scrolling down → hide
            else if (delta > 0) {
                setTransform(-NAV_HEIGHT);
                setBgOpacity(1);
            }

            // scrolling up → show
            else {
                setTransform(0);
                setBgOpacity(1);
            }

            lastScrollYRef.current = current;
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);


    return (
        <nav
            className={styles.navbar}
            style={{
                transform: `translateY(${transform}px)`,
                backgroundColor: `rgba(255,255,255,${bgOpacity})`,
                boxShadow: `0 2px 10px rgba(0,0,0,${0.1 * bgOpacity})`,
            }}
        >

            <div className={styles.container}>
                {/* LEFT: Logo now here */}
                <div className={styles.logo}>
                    <Link href="/" aria-label="Go to homepage">
                        <Image src="/logo-black.png" alt="Vriksha Logo" width={130} height={104} priority />
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
