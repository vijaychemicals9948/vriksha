import { getCatalogSnapshotSafe } from "@/lib/admin/catalog";
import FirestoreNotice from "../components/FirestoreNotice";
import { SubcategoryManager } from "../components/AdminControls";
import styles from "../admin.module.css";

export default async function AdminSubcategoriesPage() {
  const { catalog, error } = await getCatalogSnapshotSafe();

  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1>Subcategories</h1>
          <p>Manage nested catalog sections.</p>
        </div>
      </div>
      <FirestoreNotice error={error} />
      <SubcategoryManager
        categories={catalog.categories}
        subcategories={catalog.subcategories}
      />
    </main>
  );
}
