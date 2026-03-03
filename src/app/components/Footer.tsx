"use client";

import Image from "next/image";
import styles from "./Footer.module.css";
import { FaFacebookF, FaInstagram, FaYoutube } from "react-icons/fa";

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={styles.inner}>

                <Image
                    src="/logo-dark.png"
                    alt="Vriksha Logo"
                    width={150}
                    height={120}
                    className={styles.footerLogo}
                />

               

                <div className={styles.social}>
                    <a
                        href="https://www.facebook.com/VrikshaAPresentationPort"
                        aria-label="Facebook"
                        className={styles.socialIcon}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <FaFacebookF />
                    </a>

                    <a
                        href="https://www.instagram.com/vrikshapresentationport"
                        aria-label="Instagram"
                        className={styles.socialIcon}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <FaInstagram />
                    </a>

                    <a
                        href="#"
                        aria-label="YouTube"
                        className={styles.socialIcon}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <FaYoutube />
                    </a>
                </div>


                <div className={styles.footerLine}></div>

                <p className={styles.copy}>© 2025 Vriksha. All rights reserved.</p>

                <p className={styles.credit}>
                    Designed & Developed by <strong>Listen DESIGNER</strong>
                </p>
            </div>
        </footer>
    );
}
