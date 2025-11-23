import styles from './ProductsGrid.module.css';

const products = [
    {
        image: "/products/24k-gold-coated-art/brass-idol.webp",
        name: "Brass idol backed with 24 carat gold coated metal art",
    },
    {
        image: "/products/24k-gold-coated-art/balaji.webp",
        name: "Lord Balaji & Dasavatharam – 24K Gold Metal Art on Banaras Brocade - W 28 in x H 28 in",
    },
    {
        image: "/products/24k-gold-coated-art/arupadai-vedu.webp",
        name: "Arupadai veedu - Thiruthanigai malai (24K Gold Embellished Digital Art)",
    },
    {
        image: "/products/24k-gold-coated-art/arupadai.webp",
        name: "Arupadai veedu - Thiruparankundram (24K Gold Embellished Digital Art)",
    },
    {
        image: "/products/24k-gold-coated-art/thiruchendhur.webp",
        name: "Arupadai veedu - Thiruchendhur (24K Gold Embellished Digital Art)",
    },
    {
        image: "/products/24k-gold-coated-art/swamy.webp",
        name: "Arupadai veedu - Swamy malai (24K Gold Embellished Digital Art)",
    },
];

const ProductsGrid = () => {
    return (
        <section className={styles.gridSection}>
            <h2 className={styles.heading}>Explore More Metal Art</h2>
            <div className={styles.grid}>
                {products.map((product, idx) => (
                    <div key={idx} className={styles.card}>
                        <img src={product.image} alt={product.name} className={styles.image} />
                        <h3 className={styles.title}>{product.name}</h3>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default ProductsGrid;
