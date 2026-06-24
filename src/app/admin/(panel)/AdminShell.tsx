"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  FolderTree,
  Gauge,
  Image,
  Inbox,
  Layers3,
  LogOut,
  Package,
  Settings,
} from "lucide-react";
import styles from "./adminShell.module.css";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: Gauge },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/subcategories", label: "Subcategories", icon: Layers3 },
  { href: "/admin/media", label: "Media", icon: Image },
  { href: "/admin/inquiries", label: "Inquiries", icon: Inbox },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminShell({
  children,
  adminEmail,
}: {
  children: React.ReactNode;
  adminEmail: string;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/admin/session", { method: "DELETE" });
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <Link className={styles.brand} href="/admin">
          <span>Vriksha</span>
          <strong>Admin</strong>
        </Link>

        <nav className={styles.nav}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active =
              item.href === "/admin"
                ? pathname === item.href
                : pathname?.startsWith(item.href);

            return (
              <Link
                key={item.href}
                className={`${styles.navLink} ${active ? styles.active : ""}`}
                href={item.href}
              >
                <Icon size={18} aria-hidden />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className={styles.account}>
          <span>{adminEmail}</span>
          <button type="button" onClick={logout}>
            <LogOut size={17} aria-hidden />
            Logout
          </button>
        </div>
      </aside>

      <div className={styles.content}>{children}</div>
    </div>
  );
}
