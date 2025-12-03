"use client";
import Image from "next/image";
import React from "react";
import styles from "./CategoryCard.module.css";

type Props = {
    src: string;
    alt?: string;
    title?: string;
};

export default function CategoryCard({ src, alt = "", title }: Props) {
    return (
        <div className={styles.card}>
            <div className={styles.imageWrap}>
                <Image src={src} alt={alt} fill sizes="(max-width: 600px) 100vw, 33vw" style={{ objectFit: "cover" }} />
            </div>
            {title && <div className={styles.caption}>{title}</div>}
        </div>
    );
}
