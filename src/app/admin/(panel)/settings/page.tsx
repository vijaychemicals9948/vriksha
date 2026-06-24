import { getAdminEmails } from "@/lib/admin/auth";
import styles from "../admin.module.css";

export default function AdminSettingsPage() {
  const adminEmails = getAdminEmails();
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "";
  const firebaseProject = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "";
  const uploadFolder = process.env.CLOUDINARY_UPLOAD_FOLDER || "vriksha";

  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1>Settings</h1>
          <p>Active integration settings.</p>
        </div>
      </div>

      <section className={styles.stats}>
        <div className={styles.stat}>
          <span>Firebase</span>
          <strong>{firebaseProject || "-"}</strong>
        </div>
        <div className={styles.stat}>
          <span>Cloudinary</span>
          <strong>{cloudName || "-"}</strong>
        </div>
        <div className={styles.stat}>
          <span>Folder</span>
          <strong>{uploadFolder}</strong>
        </div>
        <div className={styles.stat}>
          <span>Admins</span>
          <strong>{adminEmails.length}</strong>
        </div>
      </section>
    </main>
  );
}
