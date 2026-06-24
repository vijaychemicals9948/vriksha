"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

const VISITOR_STORAGE_KEY = "vriksha_visitor_id";
const HEARTBEAT_MS = 60 * 1000;

function createVisitorId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID().replaceAll("-", "");
  }

  return `${Date.now().toString(36)}${Math.random()
    .toString(36)
    .slice(2, 14)}`;
}

function getVisitorId() {
  try {
    const existing = window.localStorage.getItem(VISITOR_STORAGE_KEY);
    if (existing) return existing;

    const next = createVisitorId();
    window.localStorage.setItem(VISITOR_STORAGE_KEY, next);
    return next;
  } catch {
    return createVisitorId();
  }
}

function sendAnalyticsEvent(
  event: "pageview" | "heartbeat",
  visitorId: string,
  path: string,
) {
  fetch("/api/analytics/visit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ event, visitorId, path }),
    keepalive: true,
  }).catch(() => {
    // Tracking should never interrupt the public site experience.
  });
}

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const visitorIdRef = useRef<string | null>(null);
  const lastPageviewPathRef = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return;

    if (!visitorIdRef.current) {
      visitorIdRef.current = getVisitorId();
    }

    const visitorId = visitorIdRef.current;
    const trackHeartbeat = () => {
      if (document.visibilityState === "visible") {
        sendAnalyticsEvent("heartbeat", visitorId, pathname);
      }
    };

    if (lastPageviewPathRef.current !== pathname) {
      lastPageviewPathRef.current = pathname;
      sendAnalyticsEvent("pageview", visitorId, pathname);
    }

    const intervalId = window.setInterval(trackHeartbeat, HEARTBEAT_MS);
    document.addEventListener("visibilitychange", trackHeartbeat);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", trackHeartbeat);
    };
  }, [pathname]);

  return null;
}
