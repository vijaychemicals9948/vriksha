"use client";

import Image from "next/image";
import styles from "./ApsaraSeries.module.css";
import { Allura, Raleway } from "next/font/google"; // 🆕 Allura font imported
import { useState } from "react";

const allura = Allura({ weight: "400", subsets: ["latin"] }); // 🆕 Allura font setup
const raleway = Raleway({ weight: ["400", "500"], subsets: ["latin"] });

export default function ApsaraSeriesPage() {
    const images = [
        "/products/apsara1.png",
        "/products/apsara2.png",
        "/products/apsara3.png",
        "/products/apsara4.png",
        "/products/apsara5.png",
    ];

    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    return (
        <div className={styles.pageContainer}>
            {/* 🖼️ Cover Image with Overlay Text */}
            <div className={styles.coverWrapper}>
                <Image
                    src="/images/apsara-on-wood-banner.png"
                    alt="Apsara Series Cover"
                    fill
                    priority
                    className={styles.coverImage}
                />
                <div className={styles.coverOverlay}></div>
                <div className={styles.textOverlay}>
                    {/* 🆕 Allura font applied */}
                    <h1 className={`${styles.coverHeading} ${allura.className}`}>
                        Apsara Series
                    </h1>
                    <p className={`${styles.coverSubtext} ${raleway.className}`}>
                        greet guests, bring home apsaras
                    </p>
                </div>
            </div>

            {/* 🪶 Main Content Section */}
            <section className={styles.mainSection}>
                <h2 className={styles.mainHeading}>
                    Apsara Series on walnut finish solid wood
                </h2>
                <p className={styles.subHeading}>
                    24 carat gold coated metal art and brass Apsara idol. W 10 x H 12 inches
                </p>
                <button className={styles.ctaButton}>Explore Collection</button>

                {/* 🌸 Infinite Sliding Image Gallery */}
                <div className={styles.slider}>
                    <div className={styles.sliderTrack}>
                        {[...images, ...images].map((src, i) => (
                            <Image
                                key={i}
                                src={src}
                                alt={`Apsara ${i + 1}`}
                                width={260}
                                height={300}
                                className={styles.slideImage}
                                onClick={() => setSelectedImage(src)}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* 🔍 Modal Popup */}
            {selectedImage && (
                <div
                    className={styles.modalOverlay}
                    onClick={() => setSelectedImage(null)}
                >
                    <div
                        className={styles.modalContent}
                        onClick={(e) => e.stopPropagation()} // prevent closing on inside click
                    >
                        {/* Left: Image */}
                        <div className={styles.modalLeft}>
                            <Image
                                src={selectedImage}
                                alt="Enlarged Apsara"
                                width={500}
                                height={600}
                                className={styles.modalImage}
                            />
                        </div>

                        {/* Right: Details */}
                        <div className={styles.modalRight}>
                            {/* 🌿 Logo */}
                            <div className={styles.logoWrapper}>
                                <Image
                                    src="/VRIKSHA-LOGO2.svg"
                                    alt="Vriksha Logo"
                                    width={190}
                                    height={50}
                                    className={styles.vrikshaLogo}
                                />
                            </div>

                            <h2>Apsara on walnut finish solid wood</h2>
                            <p>
                                24 carat gold coated metal art and brass Apsara idol.
                            </p>
                            <p>
                                <strong>Dimensions:</strong> W 10 x H 12 inches
                            </p>

                            <button className={styles.orderButton}>
                                Order Now
                            </button>

                            <p className={styles.deliveryText}>
                                🚚 Delivery within 7 days anywhere in India
                            </p>

                            <div className={styles.contactInfo}>
                                <p>For more details, contact us:</p>
                                <p>
                                    Ramesh - <a href="tel:+919444403249">9444403249</a> | Vasumathi - <a href="tel:+919940419286">9940419286</a>
                                </p>
                                <p>
                                    📧 <a href="mailto:vrikshaa@gmail.com">vrikshaa@gmail.com</a>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
