import { getCatalogSnapshotSafe } from "@/lib/admin/catalog";
import FirestoreNotice from "../components/FirestoreNotice";
import { ProductManager } from "../components/AdminControls";
import styles from "../admin.module.css";

export default async function AdminProductsPage() {
  const { catalog, error } = await getCatalogSnapshotSafe();

  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1>Products</h1>
          <p>Add, update, publish, and remove catalog products.</p>
        </div>
      </div>
      <FirestoreNotice error={error} />
      <ProductManager
        categories={catalog.categories}
        subcategories={catalog.subcategories}
        products={catalog.products}
      />
    </main>
  );
}
