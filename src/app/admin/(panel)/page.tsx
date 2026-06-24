import { getAdminEmails } from "@/lib/admin/auth";
import { getAnalyticsDashboardSafe } from "@/lib/admin/analytics";
import { getCatalogSnapshotSafe, listInquiries } from "@/lib/admin/catalog";
import FirestoreNotice from "./components/FirestoreNotice";
import styles from "./admin.module.css";

export default async function AdminDashboardPage() {
  const [catalogResult, inquiries, analyticsResult] = await Promise.all([
    getCatalogSnapshotSafe(),
    listInquiries().catch(() => []),
    getAnalyticsDashboardSafe(),
  ]);
  const { catalog, error } = catalogResult;
  const { analytics, error: analyticsError } = analyticsResult;
  const adminEmails = getAdminEmails();

  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1>Dashboard</h1>
          <p>Catalog and inquiry overview.</p>
        </div>
      </div>

      <section className={styles.stats}>
        <div className={styles.stat}>
          <span>Categories</span>
          <strong>{catalog.categories.length}</strong>
        </div>
        <div className={styles.stat}>
          <span>Subcategories</span>
          <strong>{catalog.subcategories.length}</strong>
        </div>
        <div className={styles.stat}>
          <span>Products</span>
          <strong>{catalog.products.length}</strong>
        </div>
        <div className={styles.stat}>
          <span>Inquiries</span>
          <strong>{inquiries.length}</strong>
        </div>
      </section>

      <section className={styles.sectionHeader}>
        <div>
          <h2>Visitor Tracking</h2>
          <p>Live visitor activity and first-party traffic reports.</p>
        </div>
      </section>

      {analyticsError && (
        <p className={styles.error}>
          Visitor tracking report is not available: {analyticsError}
        </p>
      )}

      {analytics && (
        <>
          <section className={`${styles.stats} ${styles.analyticsStats}`}>
            <div className={`${styles.stat} ${styles.liveStat}`}>
              <span>Active Visitors</span>
              <strong>{analytics.activeVisitors}</strong>
              <small>Last {analytics.activeWindowMinutes} minutes</small>
            </div>
            <div className={styles.stat}>
              <span>Today</span>
              <strong>{analytics.today.visitors}</strong>
              <small>{analytics.today.pageViews} page views</small>
            </div>
            <div className={styles.stat}>
              <span>Yesterday</span>
              <strong>{analytics.yesterday.visitors}</strong>
              <small>{analytics.yesterday.pageViews} page views</small>
            </div>
            <div className={styles.stat}>
              <span>This Week</span>
              <strong>{analytics.thisWeek.visitors}</strong>
              <small>{analytics.thisWeek.pageViews} page views</small>
            </div>
            <div className={styles.stat}>
              <span>This Month</span>
              <strong>{analytics.thisMonth.visitors}</strong>
              <small>{analytics.thisMonth.pageViews} page views</small>
            </div>
          </section>

          <section className={styles.reportGrid}>
            <div className={styles.reportPanel}>
              <div className={styles.reportHeader}>
                <h2>Last 7 Days</h2>
                <span>{analytics.timeZone}</span>
              </div>
              <table className={styles.reportTable}>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Visitors</th>
                    <th>Views</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.last7Days.map((day) => (
                    <tr key={day.dateKey}>
                      <td>{day.label}</td>
                      <td>{day.visitors}</td>
                      <td>{day.pageViews}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className={styles.reportPanel}>
              <div className={styles.reportHeader}>
                <h2>Top Pages This Month</h2>
                <span>{analytics.topPagesThisMonth.length} pages</span>
              </div>
              {analytics.topPagesThisMonth.length === 0 ? (
                <p className={styles.reportEmpty}>No visits tracked yet.</p>
              ) : (
                <table className={styles.reportTable}>
                  <thead>
                    <tr>
                      <th>Page</th>
                      <th>Views</th>
                      <th>Visitors</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.topPagesThisMonth.map((page) => (
                      <tr key={page.path}>
                        <td className={styles.pathCell}>{page.path}</td>
                        <td>{page.views}</td>
                        <td>{page.visitors}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>
        </>
      )}

      <FirestoreNotice error={error} />

      {adminEmails.length === 0 && (
        <p className={styles.error}>
          ADMIN_EMAILS is not set in .env.local.
        </p>
      )}
    </main>
  );
}
