"use client";

import Link from "next/link";
import Image from "next/image";
import styles from "./Footer.module.css";
import { Facebook, Instagram, Mail, MapPin } from "lucide-react";

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={styles.container}>

                {/* 🪴 Brand / Logo Section */}
                <div className={styles.column}>
                    <div className={styles.logoWrapper}>
                        <Image
                            src="/VRIKSHA-LOGO3.svg"
                            alt="Vriksha Logo"
                            width={140}
                            height={60}
                            className={styles.logo}
                        />
                    </div>
                    <p className={styles.tagline}>
                        A presentation port of divine art — blending tradition with elegance.
                    </p>
                    <p className={styles.address}>
                        <MapPin size={16} /> 1B, Prince Arcade, 22A Cathedral Road, Chennai – 600086
                    </p>
                </div>

                {/* 📞 Contact Section */}
                <div className={styles.column}>
                    <h3>Contact Us</h3>
                    <p><Mail size={16} /> <a href="mailto:vrikshaa@gmail.com">vrikshaa@gmail.com</a></p>
                </div>

                {/* 🌐 Social Links */}
                <div className={styles.column}>
                    <h3>Follow Us</h3>
                    <div className={styles.socialLinks}>
                        <Link href="https://www.facebook.com/VrikshaAPresentationPort/" target="_blank">
                            <Facebook size={20} />
                            <span>Facebook</span>
                        </Link>
                        <Link href="https://www.instagram.com/vrikshapresentationport/" target="_blank">
                            <Instagram size={20} />
                            <span>Instagram</span>
                        </Link>
                    </div>
                </div>

                {/* 📄 Quick Links */}
                <div className={styles.column}>
                    <h3>Quick Links</h3>
                    <ul className={styles.links}>
                        <li><Link href="/">Home</Link></li>
                        <li><Link href="/products">Products</Link></li>
                        <li><Link href="/help-consumer-policy">Help & Consumer Policy</Link></li>
                        <li><Link href="/terms-and-conditions">Terms & Conditions</Link></li>
                        <li><Link href="/privacy-policy">Privacy Policy</Link></li>
                        <li><Link href="/return-and-refunds">Return & Refunds</Link></li>
                        <li><Link href="/shipping">Shipping</Link></li>
                        <li><Link href="/terms-of-service">Terms of Service</Link></li>
                        <li><Link href="/refund-policy">Refund Policy</Link></li>
                    </ul>
                </div>
            </div>

            {/* © Bottom Bar */}
            <div className={styles.bottomBar}>
                <p>© {new Date().getFullYear()} Vriksha. All rights reserved.</p>
                <p>Designed & Developed by <strong>Listen DESIGNER</strong></p>
            </div>
        </footer>
    );
}
