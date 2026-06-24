import { getCatalogSnapshotSafe } from "@/lib/admin/catalog";
import FirestoreNotice from "../components/FirestoreNotice";
import { CategoryManager } from "../components/AdminControls";
import styles from "../admin.module.css";

export default async function AdminCategoriesPage() {
  const { catalog, error } = await getCatalogSnapshotSafe();

  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1>Categories</h1>
          <p>Manage top-level catalog sections and banners.</p>
        </div>
      </div>
      <FirestoreNotice error={error} />
      <CategoryManager categories={catalog.categories} />
    </main>
  );
}
