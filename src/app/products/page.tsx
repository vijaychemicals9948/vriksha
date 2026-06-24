//src/app/products/page.tsx
import OurProductsSection from "../components/homepage/OurProductsSection";
import styles from "./products.module.css";
import { getPublicCategories } from "@/lib/catalog";

export const dynamic = "force-dynamic";

type PublicCategories = Awaited<ReturnType<typeof getPublicCategories>>;

function toProductMenu(categories: PublicCategories) {
  return categories.map((category) => ({
    title: category.title,
    href: `/products/${category.slug}`,
    children: category.subcategories?.map((subcategory) => ({
      title: subcategory.title,
      href: `/products/${category.slug}/${subcategory.slug}`,
    })),
  }));
}

export default async function ProductsPage() {
  const categories = await getPublicCategories();
  const productMenu = toProductMenu(categories);

  return (
    <main className={styles.productsPage}>
      <OurProductsSection products={productMenu} />
    </main>
  );
}
