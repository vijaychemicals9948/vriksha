"use client";
import React, { useEffect, useRef, useState } from "react";
import styles from "./OutlineBox.module.css";

type Props = {
    children: React.ReactNode;
    delay?: number; // optional delay (ms)
};

export default function OutlineBoxContact({ children, delay = 0 }: Props) {
    const wrapperRef = useRef<HTMLDivElement | null>(null);
    const boxRef = useRef<HTMLDivElement | null>(null);

    // SVG path refs
    const topRef = useRef<SVGPathElement | null>(null);
    const rightRef = useRef<SVGPathElement | null>(null);
    const bottomRef = useRef<SVGPathElement | null>(null);
    const leftTopRef = useRef<SVGPathElement | null>(null);
    const leftBottomRef = useRef<SVGPathElement | null>(null);

    const lengthsRef = useRef({
        top: 0,
        right: 0,
        bottom: 0,
        leftTop: 0,
        leftBottom: 0,
    });

    const progressRef = useRef(0);
    const targetProgressRef = useRef(0);
    const rafRef = useRef<number | null>(null);
    const completedRef = useRef(false);

    const [svgSize, setSvgSize] = useState({ w: 0, h: 0 });

    /* ------------------ SVG MEASURE ------------------ */
    const recomputeSvg = () => {
        const box = boxRef.current;
        if (!box) return;

        const rect = box.getBoundingClientRect();
        const w = Math.max(20, Math.round(rect.width));
        const h = Math.max(20, Math.round(rect.height));

        setSvgSize({ w, h });

        requestAnimationFrame(() => {
            const paths = [
                ["top", topRef.current],
                ["right", rightRef.current],
                ["bottom", bottomRef.current],
                ["leftTop", leftTopRef.current],
                ["leftBottom", leftBottomRef.current],
            ] as const;

            paths.forEach(([key, el]) => {
                if (!el) return;
                const len = el.getTotalLength();
                lengthsRef.current[key] = len;
                el.style.strokeDasharray = `${len}`;
                el.style.strokeDashoffset = `${len}`;
            });
        });
    };

    /* ------------------ ANIMATION ------------------ */
    const animate = () => {
        const current = progressRef.current;
        const target = targetProgressRef.current;

        const next = current + (target - current) * 0.18;
        progressRef.current = next;

        const p = next;

        if (topRef.current)
            topRef.current.style.strokeDashoffset = `${lengthsRef.current.top * (1 - p)}`;
        if (rightRef.current)
            rightRef.current.style.strokeDashoffset = `${lengthsRef.current.right * (1 - p)}`;
        if (bottomRef.current)
            bottomRef.current.style.strokeDashoffset = `${lengthsRef.current.bottom * (1 - p)}`;
        if (leftTopRef.current)
            leftTopRef.current.style.strokeDashoffset = `${lengthsRef.current.leftTop * (1 - p)}`;
        if (leftBottomRef.current)
            leftBottomRef.current.style.strokeDashoffset = `${lengthsRef.current.leftBottom * (1 - p)}`;

        if (p >= 0.999) {
            completedRef.current = true;
            rafRef.current && cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
            return;
        }

        rafRef.current = requestAnimationFrame(animate);
    };

    const playAnimation = () => {
        if (completedRef.current) return;

        const start = () => {
            targetProgressRef.current = 1;
            rafRef.current = requestAnimationFrame(animate);
        };

        delay > 0 ? setTimeout(start, delay) : start();
    };

    /* ------------------ EFFECT ------------------ */
    useEffect(() => {
        const box = boxRef.current;
        if (!box) return;

        const ro = new ResizeObserver(() => {
            recomputeSvg();

            if (
                svgSize.w > 50 &&
                svgSize.h > 50 &&
                !completedRef.current
            ) {
                requestAnimationFrame(playAnimation);
            }
        });

        ro.observe(box);
        recomputeSvg();

        return () => {
            ro.disconnect();
            rafRef.current && cancelAnimationFrame(rafRef.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [svgSize.w, svgSize.h]);

    /* ------------------ PATHS ------------------ */
    const { w, h } = svgSize;

    const padX = 30;
    const padY = 70;
    const leftTopH = 90;
    const leftBottomH = 120;

    const topPath = w ? `M ${padX} ${padY} H ${w - padX}` : "";
    const rightPath = w ? `M ${w - padX} ${padY} V ${h - padY}` : "";
    const bottomPath = w ? `M ${w - padX} ${h - padY} H ${padX}` : "";
    const leftTopPath = w ? `M ${padX} ${padY} V ${padY + leftTopH}` : "";
    const leftBottomPath = w ? `M ${padX} ${h - padY} V ${h - padY - leftBottomH}` : "";

    return (
        <div className={styles.outlineWrapper} ref={wrapperRef}>
            <div className={styles.outlineBox} ref={boxRef}>
                {w > 0 && h > 0 && (
                    <svg
                        className={styles.outlineSvg}
                        width={w}
                        height={h}
                        viewBox={`0 0 ${w} ${h}`}
                        preserveAspectRatio="none"
                        aria-hidden
                    >
                        <path ref={topRef} d={topPath} className={styles.outlinePath} />
                        <path ref={rightRef} d={rightPath} className={styles.outlinePath} />
                        <path ref={bottomRef} d={bottomPath} className={styles.outlinePath} />
                        <path ref={leftTopRef} d={leftTopPath} className={styles.outlinePath} />
                        <path ref={leftBottomRef} d={leftBottomPath} className={styles.outlinePath} />
                    </svg>
                )}

                <div className={styles.content}>{children}</div>
            </div>
        </div>
    );
}
