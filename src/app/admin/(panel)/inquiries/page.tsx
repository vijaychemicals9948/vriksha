import { listInquiries } from "@/lib/admin/catalog";
import FirestoreNotice from "../components/FirestoreNotice";
import styles from "../admin.module.css";

export default async function AdminInquiriesPage() {
  let error: string | null = null;
  const inquiries = await listInquiries().catch((err) => {
    error = err instanceof Error ? err.message : "Failed to load inquiries";
    return [];
  });

  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1>Inquiries</h1>
          <p>Recent contact form messages.</p>
        </div>
      </div>

      <FirestoreNotice error={error} />

      {!error && inquiries.length === 0 ? (
        <p className={styles.empty}>No inquiries yet.</p>
      ) : !error ? (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Message</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {inquiries.map((inquiry) => (
                <tr key={inquiry.id}>
                  <td>
                    {inquiry.firstName} {inquiry.lastName}
                  </td>
                  <td>{inquiry.email}</td>
                  <td>{inquiry.phone}</td>
                  <td>{inquiry.message}</td>
                  <td>
                    {inquiry.createdAt
                      ? new Date(inquiry.createdAt).toLocaleString()
                      : ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </main>
  );
}
