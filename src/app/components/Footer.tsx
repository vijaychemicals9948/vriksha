"use client";

import Image from "next/image";
import styles from "./Footer.module.css";

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={styles.inner}>

                {/* LOGO */}
                <Image
                    src="/logo-dark.png"
                    alt="Vriksha Logo"
                    width={150}
                    height={120}
                    className={styles.footerLogo}
                />

                {/* TAGLINE */}
                <p className={styles.tagline}>
                    A presentation port of divine art — blending tradition with elegance.
                </p>

                {/* SOCIAL ICONS */}
                <div className={styles.social}>
                    <a href="#" aria-label="Facebook" className={styles.socialIcon}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M22 12.07C22 6.48 17.52 2 12 2S2 6.48 2 12.07c0 4.99 3.66 9.12 8.44 9.95v-7.05H7.9v-2.9h2.53V9.41c0-2.5 1.49-3.88 3.77-3.88 1.09 0 2.23.2 2.23.2v2.45h-1.25c-1.23 0-1.61.77-1.61 1.56v1.87h2.74l-.44 2.9h-2.3V22c4.78-.83 8.44-4.96 8.44-9.93z" />
                        </svg>
                    </a>

                    <a href="#" aria-label="Instagram" className={styles.socialIcon}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm5 6.4A4.6 4.6 0 1 0 16.6 13 4.6 4.6 0 0 0 12 8.4zM18.4 6a1.1 1.1 0 1 1-1.1-1.1A1.1 1.1 0 0 1 18.4 6z" />
                        </svg>
                    </a>

                    <a href="#" aria-label="YouTube" className={styles.socialIcon}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M23.5 6.2a3 3 0 0 0-2.12-2.12C19.84 3.5 12 3.5 12 3.5s-7.84 0-9.38.58A3 3 0 0 0 .5 6.2 31.9 31.9 0 0 0 0 12a31.9 31.9 0 0 0 .5 5.8 3 3 0 0 0 2.12 2.12C4.16 20.5 12 20.5 12 20.5s7.84 0 9.38-.58a3 3 0 0 0 2.12-2.12A31.9 31.9 0 0 0 24 12a31.9 31.9 0 0 0-.5-5.8zM9.75 15.02V8.98L15.5 12l-5.75 3.02z" />
                        </svg>
                    </a>
                </div>

                {/* DIVIDER */}
                <div className={styles.footerLine}></div>

                {/* COPYRIGHT + CREDIT */}
                <p className={styles.copy}>© 2025 Vriksha. All rights reserved.</p>

                <p className={styles.credit}>
                    Designed & Developed by <strong>Listen DESIGNER</strong>
                </p>
            </div>
        </footer>
    );
}
