//src/app/products/page.tsx
import OurProductsSection from "../components/homepage/OurProductsSection";
import styles from "./products.module.css"; // 👈 ye line add karo

export default function ProductsPage() {
    return (
        <main className={styles.productsPage}>
            <OurProductsSection />
        </main>
    );
}
