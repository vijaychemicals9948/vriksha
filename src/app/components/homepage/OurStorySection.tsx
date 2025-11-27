// File: OurStorySection.tsx


import React from "react";
import Image from "next/image";
import styles from "./OurStorySection.module.css";


export default function OurStorySection() {
    return (
        <section className={styles.wrapper} aria-labelledby="our-story-title">
            <div className={styles.outlineBox}>
            <div className={styles.container}>
                <div className={styles.left}>
                    <h2 id="our-story-title" className={styles.title}>
                        Our Story
                    </h2>
                    <div className={styles.imageWrap}>
                        {/* using native next/image for optimization */}
                        <Image
                            src="/homepage/office.png"
                            alt="Vriksha studio office"
                            fill
                            sizes="(max-width: 768px) 100vw, 50vw"
                            style={{ objectFit: "cover" }}
                            priority
                        />
                    </div>
                </div>


                <div className={styles.right}>
                    <p>
                        Vriksha is a boutique creative studio born from the shared passion of
                        husband-and-wife duo Vasumathi and Ramesh Kannan. What began as a
                        small dream has grown into a space where art, storytelling, and
                        craftsmanship come together.
                    </p>


                    <p>
                        At the heart of Vriksha is Vasumathi, the artist whose hands and
                        imagination shape every beautiful piece. Her work blends sensitivity,
                        detail, and a deep love for artistry. Complementing her is Ramesh,
                        the creative mind and copywriter who brings ideas to life with
                        thoughtful concepts and expressive words.
                    </p>


                    <p>
                        Together, they create a wide range of bespoke home décor products,
                        each crafted with intention and care. Vriksha also specialises in
                        customised mementos, personalised cards, and keepsakes for weddings,
                        special occasions, and celebrations of every kind — pieces designed
                        to be cherished for years.
                    </p>


                    <p>
                        At Vriksha, every creation has a story, a soul, and a touch of the
                        personal. It’s not just a studio — it’s a celebration of creativity,
                        collaboration, and meaningful craftsmanship.
                    </p>
                </div>
                </div>
            </div>
        </section>
    );
}