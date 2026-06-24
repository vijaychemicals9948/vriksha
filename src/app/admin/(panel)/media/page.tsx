import { MediaUploader } from "../components/AdminControls";
import styles from "../admin.module.css";

export default function AdminMediaPage() {
  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1>Media</h1>
          <p>Upload images to Cloudinary with optimized delivery URLs.</p>
        </div>
      </div>
      <MediaUploader />
    </main>
  );
}
