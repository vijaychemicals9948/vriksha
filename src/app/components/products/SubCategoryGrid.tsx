
// src/app/components/products/SubCategoryGrid.tsx

import Link from "next/link";
import Image from "next/image";
import styles from "./SubCategoryGrid.module.css";

type SubCategory = {
    slug: string;
    title: string;
    thumb: string;
};


type Props = {
    baseSlug: string;
    subcategories: SubCategory[];
};

export default function SubCategoryGrid({ baseSlug, subcategories }: Props) {
    return (
        <div className={styles.grid}>
            {subcategories.map((sub) => (
                <Link
                    key={sub.slug}
                    href={`/products/${baseSlug}/${sub.slug}`}
                    className={styles.card}
                >
                    <Image
                        src={sub.thumb}
                        alt={sub.title}
                        width={600}
                        height={400}
                    />

                    <div className={styles.title}>{sub.title}</div>
                </Link>
            ))}
        </div>
    );
}

