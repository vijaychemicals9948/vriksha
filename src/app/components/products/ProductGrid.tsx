// ProductGrid.tsx
"use client";

import styles from "./ProductGrid.module.css";

export type Product = {
    id: number;
    title: string;
    img: string;
    zoomImg?: string;
};

type Props = {
    products: Product[];
    onOpen: (index: number) => void;
};

export default function ProductGrid({ products, onOpen }: Props) {
    return (
        <div className={styles.grid}>
            {products.map((p, i) => (
                <div key={p.id} className={styles.card}>
                    <div
                        className={styles.imgWrap}
                        onClick={() => onOpen(i)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") onOpen(i);
                        }}
                    >
                        <img src={p.img} alt={p.title} className={styles.productImg} />
                    </div>
                    <h3 className={styles.productTitle}>{p.title}</h3>
                </div>
            ))}
        </div>
    );
}
