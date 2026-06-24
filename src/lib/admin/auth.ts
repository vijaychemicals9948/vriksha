import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase/admin";

export const ADMIN_SESSION_COOKIE = "vriksha_admin_session";
export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 24 * 5;

export type AdminUser = {
  uid: string;
  email: string;
};

export function getAdminEmails() {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isAllowedAdminEmail(email?: string | null) {
  if (!email) return false;
  const allowed = getAdminEmails();
  return allowed.length > 0 && allowed.includes(email.toLowerCase());
}

export async function verifyAdminSessionCookie(sessionCookie?: string) {
  if (!sessionCookie) return null;

  const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
  if (!isAllowedAdminEmail(decoded.email)) return null;

  return {
    uid: decoded.uid,
    email: decoded.email ?? "",
  };
}

export async function getCurrentAdmin() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  if (!sessionCookie) return null;

  try {
    return await verifyAdminSessionCookie(sessionCookie);
  } catch {
    return null;
  }
}

export async function requireAdmin() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    throw new Error("Unauthorized");
  }
  return admin;
}
