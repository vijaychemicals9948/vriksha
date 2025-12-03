// components/OutlineBoxVertical.tsx
"use client";

import React from "react";
import styles from "./OutlineBoxVertical.module.css";

interface OutlineBoxVerticalProps {
    className?: string;
    children?: React.ReactNode;
}

export default function OutlineBoxVertical({ className, children }: OutlineBoxVerticalProps) {
    const combinedClass = [styles.wrapper, className].filter(Boolean).join(" ");

    return (
        <div className={combinedClass} aria-hidden={children ? "false" : "true"}>
            {children ? <div className={styles.inner}>{children}</div> : null}
        </div>
    );
}
