import styles from "../admin.module.css";

export default function FirestoreNotice({ error }: { error?: string | null }) {
  if (!error) return null;

  return (
    <section className={styles.notice}>
      <h2>Firestore Setup Needed</h2>
      <p>
        Firebase Authentication is working, but Firestore Database is not enabled
        yet. Open Firebase Console, go to Firestore Database, create a database,
        then refresh this admin panel.
      </p>
      <p className={styles.noticeDetail}>{error}</p>
    </section>
  );
}
