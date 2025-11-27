"use client";
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import styles from "./Hamburger.module.css";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

type Props = {
    open: boolean;
    setOpen: (v: boolean) => void;
};

const ANIM_DURATION = 500; // must match/ exceed longest CSS transition

export default function Hamburger({ open, setOpen }: Props) {
    const router = useRouter();

    // keep portal mounted while closing animation runs
    const [renderPortal, setRenderPortal] = useState<boolean>(open);
    const [stateClass, setStateClass] = useState<"" | "open" | "closing">(open ? "open" : "");
    const [query, setQuery] = useState("");

    useEffect(() => {
        if (open) {
            setRenderPortal(true);
            // small delay to ensure CSS class applied after mount for transition
            const id = window.setTimeout(() => setStateClass("open"), 8);
            return () => clearTimeout(id);
        } else {
            setStateClass("closing");
            const t = window.setTimeout(() => {
                setRenderPortal(false);
                setStateClass("");
            }, ANIM_DURATION);
            return () => window.clearTimeout(t);
        }
    }, [open]);

    // focus first link when opened
    useEffect(() => {
        if (open) {
            const t = window.setTimeout(() => {
                const first = document.querySelector<HTMLAnchorElement>("#main-navigation a");
                first?.focus();
            }, 120);
            return () => clearTimeout(t);
        }
    }, [open]);

    // close on ESC
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpen(false);
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [setOpen]);

    // body scroll lock
    useEffect(() => {
        const original = typeof document !== "undefined" ? document.body.style.overflow : "";
        if (open) document.body.style.overflow = "hidden";
        else document.body.style.overflow = original;
        return () => {
            document.body.style.overflow = original;
        };
    }, [open]);

    const mainLinks = [
        { href: "/", label: "Home" },
        { href: "/about", label: "Our Story" },
        { href: "/services", label: "Our Services" },
        { href: "/products", label: "Our Products" },
        { href: "/clients", label: "Our Clients" },
        { href: "/blog", label: "Blog" },
        { href: "/contact", label: "Contact" },
    ];

    const onSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const q = query.trim();
        if (!q) return;
        setOpen(false);
        // navigate to search results page (adjust path if you use a different route)
        router.push(`/search?q=${encodeURIComponent(q)}`);
    };

    const modalContent = (
        <div
            id="main-navigation"
            className={`${styles.mobileMenu} ${stateClass === "open" ? styles.open : ""} ${stateClass === "closing" ? styles.closing : ""
                }`}
            role="dialog"
            aria-modal="true"
            aria-hidden={!open}
            onClick={(e) => {
                if (e.target === e.currentTarget) setOpen(false);
            }}
        >
            <div className={styles.mobileMenuContent} role="menu" aria-label="Main menu">
                <div className={styles.mobileMenuInner}>
                    <ul>
                        {mainLinks.map((l, i) => (
                            <li key={`${l.href}-${i}`} style={{ transitionDelay: `${i * 60}ms` }}>
                                <Link href={l.href} onClick={() => setOpen(false)}>
                                    {l.label}
                                </Link>
                            </li>
                        ))}
                    </ul>

                    <div className={styles.mobileFooter}>
                        <div className={styles.socialIcons} aria-label="Social links">
                            <a
                                href="https://facebook.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Facebook"
                                title="Facebook"
                            >
                                <Facebook size={18} />
                            </a>

                            <a
                                href="https://twitter.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Twitter"
                                title="Twitter"
                            >
                                <Twitter size={18} />
                            </a>

                            <a
                                href="https://instagram.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Instagram"
                                title="Instagram"
                            >
                                <Instagram size={18} />
                            </a>

                            <a
                                href="https://linkedin.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="LinkedIn"
                                title="LinkedIn"
                            >
                                <Linkedin size={18} />
                            </a>
                        </div>

                        <form className={styles.searchBar} role="search" onSubmit={onSearch}>
                            <label htmlFor="mobile-search" className={styles.visuallyHidden}>
                                Search site
                            </label>
                            <input
                                id="mobile-search"
                                type="search"
                                placeholder="Search..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                            />
                            <button type="submit" aria-label="Search">
                                Search
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <>
            <button
                className={`${styles.hamburger} ${open ? styles.open : ""}`}
                onClick={() => setOpen(!open)}
                aria-expanded={open}
                aria-controls="main-navigation"
                aria-label={open ? "Close menu" : "Open menu"}
                type="button"
            >
                <span className={styles.line} />
                <span className={styles.line} />
                <span className={styles.line} />
            </button>

            {renderPortal && typeof document !== "undefined" ? createPortal(modalContent, document.body) : null}
        </>
    );
}
