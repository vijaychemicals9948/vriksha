import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";

const ANALYTICS_COLLECTIONS = {
  activeVisitors: "analytics_active_visitors",
  days: "analytics_days",
};

const ACTIVE_WINDOW_MINUTES = 5;
const ACTIVE_WINDOW_MS = ACTIVE_WINDOW_MINUTES * 60 * 1000;
const DEFAULT_TIME_ZONE = "Asia/Kolkata";
const IGNORED_ANALYTICS_PATHS = new Set(["/codex-analytics-smoke"]);

export type AnalyticsEventType = "pageview" | "heartbeat";

export type TrackAnalyticsInput = {
  visitorId: string;
  event: AnalyticsEventType;
  path: string;
};

export type AnalyticsPeriodStats = {
  visitors: number;
  pageViews: number;
};

export type AnalyticsDailyStats = AnalyticsPeriodStats & {
  dateKey: string;
  label: string;
};

export type AnalyticsPageStats = {
  path: string;
  views: number;
  visitors: number;
};

export type AnalyticsDashboard = {
  activeVisitors: number;
  activeWindowMinutes: number;
  today: AnalyticsPeriodStats;
  yesterday: AnalyticsPeriodStats;
  thisWeek: AnalyticsPeriodStats;
  thisMonth: AnalyticsPeriodStats;
  last7Days: AnalyticsDailyStats[];
  topPagesThisMonth: AnalyticsPageStats[];
  timeZone: string;
  generatedAt: string;
};

type StoredDay = {
  uniqueVisitors?: unknown;
  pageViews?: unknown;
};

type StoredPage = {
  path?: unknown;
  views?: unknown;
  uniqueVisitors?: unknown;
};

function getAnalyticsTimeZone() {
  return process.env.ANALYTICS_TIME_ZONE || DEFAULT_TIME_ZONE;
}

function toNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function pad2(value: number) {
  return String(value).padStart(2, "0");
}

function getLocalDateParts(date: Date) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: getAnalyticsTimeZone(),
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const parts = formatter.formatToParts(date);
  const year = Number(parts.find((part) => part.type === "year")?.value);
  const month = Number(parts.find((part) => part.type === "month")?.value);
  const day = Number(parts.find((part) => part.type === "day")?.value);

  return { year, month, day };
}

function getDateKey(date = new Date()) {
  const { year, month, day } = getLocalDateParts(date);
  return `${year}-${pad2(month)}-${pad2(day)}`;
}

function splitDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return { year, month, day };
}

function addDays(dateKey: string, days: number) {
  const { year, month, day } = splitDateKey(dateKey);
  const shifted = new Date(Date.UTC(year, month - 1, day + days, 12));
  return getDateKey(shifted);
}

function getWeekStart(dateKey: string) {
  const { year, month, day } = splitDateKey(dateKey);
  const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  const daysSinceMonday = (weekday + 6) % 7;
  return addDays(dateKey, -daysSinceMonday);
}

function getMonthStart(dateKey: string) {
  const { year, month } = splitDateKey(dateKey);
  return `${year}-${pad2(month)}-01`;
}

function getDateKeyRange(startKey: string, endKey: string) {
  const keys: string[] = [];
  let current = startKey;

  while (current <= endKey) {
    keys.push(current);
    current = addDays(current, 1);
  }

  return keys;
}

function getDayLabel(dateKey: string) {
  const { year, month, day } = splitDateKey(dateKey);
  const date = new Date(Date.UTC(year, month - 1, day, 12));

  return new Intl.DateTimeFormat("en-IN", {
    timeZone: getAnalyticsTimeZone(),
    day: "2-digit",
    month: "short",
  }).format(date);
}

function summarizeDays(
  dateKeys: string[],
  dayMap: Map<string, AnalyticsPeriodStats>,
): AnalyticsPeriodStats {
  return dateKeys.reduce(
    (summary, dateKey) => {
      const stats = dayMap.get(dateKey);
      if (!stats) return summary;

      return {
        visitors: summary.visitors + stats.visitors,
        pageViews: summary.pageViews + stats.pageViews,
      };
    },
    { visitors: 0, pageViews: 0 },
  );
}

function getPageDocId(path: string) {
  if (path === "/") return "home";
  return Buffer.from(path, "utf8").toString("base64url");
}

export function normalizeAnalyticsPath(value: string) {
  try {
    const parsed = new URL(value, "https://vriksha.local");
    const path = parsed.pathname.replace(/\/+$/, "") || "/";

    if (
      IGNORED_ANALYTICS_PATHS.has(path) ||
      path.startsWith("/admin") ||
      path.startsWith("/api") ||
      path.startsWith("/_next")
    ) {
      return null;
    }

    return path;
  } catch {
    return null;
  }
}

export async function trackAnalyticsEvent(input: TrackAnalyticsInput) {
  const path = normalizeAnalyticsPath(input.path);
  if (!path) {
    return { tracked: false };
  }

  const serverTimestamp = FieldValue.serverTimestamp();
  const dateKey = getDateKey();
  const dayRef = adminDb.collection(ANALYTICS_COLLECTIONS.days).doc(dateKey);
  const activeVisitorRef = adminDb
    .collection(ANALYTICS_COLLECTIONS.activeVisitors)
    .doc(input.visitorId);

  await adminDb.runTransaction(async (transaction) => {
    const visitorRef = dayRef.collection("visitors").doc(input.visitorId);
    const pageRef = dayRef.collection("pages").doc(getPageDocId(path));
    const pageVisitorRef = pageRef.collection("visitors").doc(input.visitorId);
    const [visitorSnapshot, pageVisitorSnapshot] =
      input.event === "pageview"
        ? await Promise.all([
            transaction.get(visitorRef),
            transaction.get(pageVisitorRef),
          ])
        : [null, null];

    transaction.set(
      activeVisitorRef,
      {
        visitorId: input.visitorId,
        lastPath: path,
        lastSeenAt: serverTimestamp,
      },
      { merge: true },
    );

    if (input.event !== "pageview") {
      return;
    }

    if (!visitorSnapshot || !pageVisitorSnapshot) {
      return;
    }

    transaction.set(
      dayRef,
      {
        dateKey,
        pageViews: FieldValue.increment(1),
        uniqueVisitors: FieldValue.increment(visitorSnapshot.exists ? 0 : 1),
        updatedAt: serverTimestamp,
      },
      { merge: true },
    );

    transaction.set(
      visitorRef,
      visitorSnapshot.exists
        ? {
            lastSeenAt: serverTimestamp,
            pageViews: FieldValue.increment(1),
          }
        : {
            visitorId: input.visitorId,
            firstSeenAt: serverTimestamp,
            lastSeenAt: serverTimestamp,
            pageViews: FieldValue.increment(1),
          },
      { merge: true },
    );

    transaction.set(
      pageRef,
      {
        path,
        views: FieldValue.increment(1),
        uniqueVisitors: FieldValue.increment(
          pageVisitorSnapshot.exists ? 0 : 1,
        ),
        updatedAt: serverTimestamp,
      },
      { merge: true },
    );

    transaction.set(
      pageVisitorRef,
      pageVisitorSnapshot.exists
        ? { lastSeenAt: serverTimestamp }
        : {
            visitorId: input.visitorId,
            firstSeenAt: serverTimestamp,
            lastSeenAt: serverTimestamp,
          },
      { merge: true },
    );
  });

  return { tracked: true };
}

async function getTopPagesForDateKeys(dateKeys: string[]) {
  const pageMap = new Map<string, AnalyticsPageStats>();
  const snapshots = await Promise.all(
    dateKeys.map((dateKey) =>
      adminDb
        .collection(ANALYTICS_COLLECTIONS.days)
        .doc(dateKey)
        .collection("pages")
        .get(),
    ),
  );

  snapshots.forEach((snapshot) => {
    snapshot.docs.forEach((doc) => {
      const data = doc.data() as StoredPage;
      const path = typeof data.path === "string" ? data.path : doc.id;
      const normalizedPath = normalizeAnalyticsPath(path);
      if (!normalizedPath) return;
      const current = pageMap.get(normalizedPath) || {
        path: normalizedPath,
        views: 0,
        visitors: 0,
      };

      pageMap.set(normalizedPath, {
        path: normalizedPath,
        views: current.views + toNumber(data.views),
        visitors: current.visitors + toNumber(data.uniqueVisitors),
      });
    });
  });

  return Array.from(pageMap.values())
    .sort((a, b) => b.views - a.views)
    .slice(0, 8);
}

export async function getAnalyticsDashboard(): Promise<AnalyticsDashboard> {
  const now = new Date();
  const todayKey = getDateKey(now);
  const yesterdayKey = addDays(todayKey, -1);
  const weekKeys = getDateKeyRange(getWeekStart(todayKey), todayKey);
  const monthKeys = getDateKeyRange(getMonthStart(todayKey), todayKey);
  const last7Keys = getDateKeyRange(addDays(todayKey, -6), todayKey);
  const allKeys = Array.from(
    new Set([yesterdayKey, ...weekKeys, ...monthKeys, ...last7Keys]),
  );
  const dayRefs = allKeys.map((dateKey) =>
    adminDb.collection(ANALYTICS_COLLECTIONS.days).doc(dateKey),
  );

  const activeSince = Timestamp.fromMillis(now.getTime() - ACTIVE_WINDOW_MS);
  const [activeSnapshot, daySnapshots, topPagesThisMonth] = await Promise.all([
    adminDb
      .collection(ANALYTICS_COLLECTIONS.activeVisitors)
      .where("lastSeenAt", ">=", activeSince)
      .get(),
    adminDb.getAll(...dayRefs),
    getTopPagesForDateKeys(monthKeys),
  ]);

  const dayMap = new Map<string, AnalyticsPeriodStats>();

  daySnapshots.forEach((snapshot) => {
    const data = snapshot.data() as StoredDay | undefined;
    dayMap.set(snapshot.id, {
      visitors: toNumber(data?.uniqueVisitors),
      pageViews: toNumber(data?.pageViews),
    });
  });

  return {
    activeVisitors: activeSnapshot.size,
    activeWindowMinutes: ACTIVE_WINDOW_MINUTES,
    today: summarizeDays([todayKey], dayMap),
    yesterday: summarizeDays([yesterdayKey], dayMap),
    thisWeek: summarizeDays(weekKeys, dayMap),
    thisMonth: summarizeDays(monthKeys, dayMap),
    last7Days: last7Keys.map((dateKey) => ({
      dateKey,
      label: getDayLabel(dateKey),
      ...(dayMap.get(dateKey) || { visitors: 0, pageViews: 0 }),
    })),
    topPagesThisMonth,
    timeZone: getAnalyticsTimeZone(),
    generatedAt: now.toISOString(),
  };
}

export async function getAnalyticsDashboardSafe() {
  try {
    return {
      analytics: await getAnalyticsDashboard(),
      error: null,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load analytics";

    return {
      analytics: null,
      error: message,
    };
  }
}
