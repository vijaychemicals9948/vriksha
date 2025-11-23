"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import styles from "./products.module.css";

export default function ProductsCollectionPage() {
    const collections = [
        { slug: "apsara-series", title: "Apsara Series", subtitle: "Prabhavali & silk prints", image: "/collections/apsara.webp", tag: "New" },
        { slug: "24k-gold-coated-art", title: "24K Gold Coated Art", subtitle: "Festive curated collection", image: "/collections/1.webp", tag: "Curated" },
        { slug: "arupadai", title: "Arupadai Vedu", subtitle: "Hand-finished motifs", image: "/collections/arupadai.webp", tag: "Limited" },
        { slug: "dasavataram", title: "Dasavataram", subtitle: "Bold lines, bright colours", image: "/collections/dasavataram.webp", tag: "Popular" },
        { slug: "decorative-serving-trays", title: "Decorative Serving Trays", subtitle: "Timeless silk weaves", image: "/collections/decorative-serving-trays.webp", tag: "Luxury" },
        { slug: "parabhavali", title: "Parabhavali & Raw Silk", subtitle: "Handwork & details", image: "/collections/parabhavali.webp", tag: "Handmade" },
    ];

    function stylesCountFromSlug(slug: string) {
        let h = 0;
        for (let i = 0; i < slug.length; i++) {
            h = (h << 5) - h + slug.charCodeAt(i);
            h |= 0;
        }
        const abs = Math.abs(h);
        return (abs % 25) + 8; // 8 – 32
    }

    return (
        <main className={styles.main}>
            {/* HERO */}
            <header className={styles.hero}>
                <div className={styles.heroBackground}>
                    <div className={styles.heroOverlay} />
                    <div className={styles.container}>
                        <div className={styles.heroContent}>
                            <motion.div
                                initial={{ opacity: 0, y: 35 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.9, ease: "easeOut" }}
                            >
                                <h1>Explore Collections</h1>
                                <p className={styles.heroSubtitle}>
                                    Divine craftsmanship in 24K gold-coated brass art, handwoven silks, and
                                    limited-edition heritage masterpieces.
                                </p>
                                <div className={styles.heroButtons}>
                                    <Link href="/products" className={styles.btnPrimary}>
                                        Shop All Collections
                                    </Link>
                                    <a href="#collections" className={styles.btnSecondary}>
                                        Browse Collections
                                    </a>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </header>
            {/* Breadcrumb & Section Header */}
            <section className={styles.container} style={{ padding: "3rem 0" }}>
                <nav className={styles.breadcrumb}>
                    <Link href="/">Home</Link> /{" "}
                    <span style={{ color: "#1e293b" }}>Explore Collections</span>
                </nav>
                <div className={styles.sectionHeader}>
                    <div>
                        <h2 className={styles.sectionTitle}>Our Signature Collections</h2>
                        <p className={styles.sectionDesc}>
                            Curated lines celebrating Indian textile heritage with contemporary sophistication.
                        </p>
                    </div>
                    <div className={styles.filters}>
                        <select className={styles.filterSelect}>
                            <option>All Categories</option>
                            <option>Silk</option>
                            <option>Handwoven</option>
                            <option>Festive</option>
                        </select>
                        <select className={styles.filterSelect}>
                            <option>Sort: Featured</option>
                            <option>Newest First</option>
                            <option>Most Popular</option>
                        </select>
                    </div>
                </div>
            </section>
            {/* Collections Grid */}
            <section id="collections" className={styles.container}>
                <div className={styles.collectionsGrid}>
                    {collections.map((c, i) => (
                        <motion.article
                            key={c.slug}
                            initial={{ opacity: 0, y: 25 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.45, delay: i * 0.07, ease: "easeOut" }}
                            viewport={{ once: true }}
                            className={styles.card}
                        >
                            <Link href={`/products/${c.slug}`} className="block">
                                <div className={styles.cardImage}>
                                    <Image
                                        src={c.image}
                                        alt={c.title}
                                        fill
                                        sizes="(max-width: 1024px) 100vw, 33vw"
                                        style={{ objectFit: "cover" }}
                                    />
                                    <span className={styles.tag}>{c.tag}</span>
                                    <div className={styles.cardOverlay} />
                                </div>
                                <div className={styles.cardContent}>
                                    <h3 className={styles.cardTitle}>{c.title}</h3>
                                    <p className={styles.cardSubtitle}>{c.subtitle}</p>
                                    <div className={styles.cardFooter}>
                                        <span className={styles.stylesCount}>
                                            {stylesCountFromSlug(c.slug)} styles available
                                        </span>
                                        <span className={styles.viewLink}>View Collection →</span>
                                    </div>
                                </div>
                            </Link>
                        </motion.article>
                    ))}
                </div>
                {/* CTA Strip */}
                <div className={styles.ctaStrip}>
                    <div className={styles.ctaText}>
                        <h4>Looking for the complete catalog?</h4>
                        <p>
                            Download our latest seasonal lookbook or inquire about bespoke and wholesale orders.
                        </p>
                    </div>
                    <div className={styles.ctaButtons}>
                        <a href="#" className={styles.btnPrimary}>Download Catalog</a>
                        <Link href="/contact" className={styles.btnSecondary}>Get in Touch</Link>
                    </div>
                </div>
            </section>
        </main>
    );
}