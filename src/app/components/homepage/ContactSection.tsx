"use client";

import React from "react";
import Image from "next/image";
import styles from "./ContactSection.module.css";
import OutlineBox from "./OutlineBox";

export default function ContactSection() {
    // OPTIONAL: keep offsets for BG logo
    const containerStyle = {
        ["--logo-offset-x"]: "-80px",
        ["--logo-offset-y"]: "-40px",

    } as React.CSSProperties;

    return (
        <section className={styles.wrapper} aria-labelledby="our-story-title">
            {/* Background logo */}
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
                            Connect
                        </h2>

                        {/* Image is now STATIC */}
                        <div className={styles.imageOuter}>
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
                        {/* Container for right column content */}
                        <div>
                            <div className={styles.logoBox}>
                                <Image
                                    src="/homepage/contact-vriksha-logo.png"
                                    alt="Vriksha Logo"
                                    width={180}
                                    height={145}
                                    className={styles.logo}
                                />
                                <div className={styles.brandLine}>Indian Home Decor Studio</div>
                            </div>

                            <div className={styles.personLine}>
                                <p>Vasumathi Ramesh: 9940419286</p>
                                <p>Ramesh Kannan: 9444403249 </p>
                            </div>

                            <div className={styles.space} />

                            <div className={styles.address}>
                                <p>1B, Prince Arcade</p>
                                <p>22A, Cathedral Road </p>
                                <p>Chennai 600086</p>
                            </div>

                            <div className={styles.space} />

                            <div className={styles.infoLine}>vrikshaa@gmail.com</div>
                            <div className={styles.infoLine}>www.vriksha.co.in</div>

                            <div className={styles.space} />

                            {/* Social links — each link shows two stacked spans */}
                            <div className={styles.socialLinks}>
                                <a
                                    href="https://www.facebook.com/VrikshaAPresentationPort/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={styles.socialLink}
                                >
                                    <span>https://www.facebook.com/</span>
                                    <span>VrikshaAPresentationPort/</span>
                                </a>

                                <a
                                    href="https://www.instagram.com/vrikshapresentationport/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={styles.socialLink}
                                >
                                    <span>https://www.instagram.com/</span>
                                    <span>vrikshapresentationport/</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </OutlineBox>
        </section>
    );
}
