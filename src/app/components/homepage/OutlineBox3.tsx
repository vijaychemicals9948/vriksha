"use client";
import React, { useEffect, useRef, useState } from "react";
import styles from "./OutlineBox3.module.css";

type Props = { children: React.ReactNode };

export default function OutlineBox3({ children }: Props) {
    const wrapperRef = useRef<HTMLDivElement | null>(null);
    const boxRef = useRef<HTMLDivElement | null>(null);

    // SVG path refs
    const topLeftRef = useRef<SVGPathElement | null>(null);
    const topRightRef = useRef<SVGPathElement | null>(null);
    const rightRef = useRef<SVGPathElement | null>(null);
    const bottomLeftRef = useRef<SVGPathElement | null>(null);
    const bottomRightRef = useRef<SVGPathElement | null>(null);
    const leftRef = useRef<SVGPathElement | null>(null); // single continuous left path

    const lengthsRef = useRef({
        topLeft: 0,
        topRight: 0,
        right: 0,
        bottomLeft: 0,
        bottomRight: 0,
        left: 0,
    });

    const progressRef = useRef(0);
    const targetProgressRef = useRef(0);
    const rafRef = useRef<number | null>(null);
    const completedRef = useRef(false);

    const [svgSize, setSvgSize] = useState({ w: 0, h: 0 });

    const computeTargetProgress = () => {
        const wrapper = wrapperRef.current;
        const box = boxRef.current;
        if (!wrapper || !box) return;

        const rect = wrapper.getBoundingClientRect();
        const vh = window.innerHeight;

        const enterStart = vh;
        const enterEnd = vh * 0.35;

        let progress = (enterStart - rect.top) / (enterStart - enterEnd);
        progress = Math.max(0, Math.min(1, progress));

        if (completedRef.current) {
            targetProgressRef.current = 1;
        } else {
            targetProgressRef.current = progress;
        }

        if (rafRef.current === null) {
            rafRef.current = requestAnimationFrame(animate);
        }
    };

    const recomputeSvg = () => {
        const box = boxRef.current;
        if (!box) return;

        const rect = box.getBoundingClientRect();
        const w = Math.max(20, Math.round(rect.width));
        const h = Math.max(20, Math.round(rect.height));
        const sizeChanged = w !== svgSize.w || h !== svgSize.h;
        setSvgSize({ w, h });

        requestAnimationFrame(() => {
            const topLeft = topLeftRef.current;
            const topRight = topRightRef.current;
            const right = rightRef.current;
            const bottomLeft = bottomLeftRef.current;
            const bottomRight = bottomRightRef.current;
            const left = leftRef.current;

            const newTopLeft = topLeft ? topLeft.getTotalLength() : 0;
            const newTopRight = topRight ? topRight.getTotalLength() : 0;
            const newRight = right ? right.getTotalLength() : 0;
            const newBottomLeft = bottomLeft ? bottomLeft.getTotalLength() : 0;
            const newBottomRight = bottomRight ? bottomRight.getTotalLength() : 0;
            const newLeft = left ? left.getTotalLength() : 0;

            const prev = lengthsRef.current;
            const changed =
                newTopLeft !== prev.topLeft ||
                newTopRight !== prev.topRight ||
                newRight !== prev.right ||
                newBottomLeft !== prev.bottomLeft ||
                newBottomRight !== prev.bottomRight ||
                newLeft !== prev.left ||
                sizeChanged;

            lengthsRef.current.topLeft = newTopLeft;
            lengthsRef.current.topRight = newTopRight;
            lengthsRef.current.right = newRight;
            lengthsRef.current.bottomLeft = newBottomLeft;
            lengthsRef.current.bottomRight = newBottomRight;
            lengthsRef.current.left = newLeft;

            const currProgress = progressRef.current ?? 0;

            if (topLeft) {
                topLeft.style.strokeDasharray = `${lengthsRef.current.topLeft}`;
                topLeft.style.strokeDashoffset = `${Math.round(lengthsRef.current.topLeft * (1 - currProgress))}`;
            }
            if (topRight) {
                topRight.style.strokeDasharray = `${lengthsRef.current.topRight}`;
                topRight.style.strokeDashoffset = `${Math.round(lengthsRef.current.topRight * (1 - currProgress))}`;
            }
            if (right) {
                // ensure right has dasharray too and same offset pattern
                right.style.strokeDasharray = `${lengthsRef.current.right}`;
                right.style.strokeDashoffset = `${Math.round(lengthsRef.current.right * (1 - currProgress))}`;
            }
            if (bottomLeft) {
                bottomLeft.style.strokeDasharray = `${lengthsRef.current.bottomLeft}`;
                bottomLeft.style.strokeDashoffset = `${Math.round(lengthsRef.current.bottomLeft * (1 - currProgress))}`;
            }
            if (bottomRight) {
                bottomRight.style.strokeDasharray = `${lengthsRef.current.bottomRight}`;
                bottomRight.style.strokeDashoffset = `${Math.round(lengthsRef.current.bottomRight * (1 - currProgress))}`;
            }
            if (left) {
                left.style.strokeDasharray = `${lengthsRef.current.left}`;
                left.style.strokeDashoffset = `${Math.round(lengthsRef.current.left * (1 - currProgress))}`;
            }
        });
    };

    const animate = () => {
        const topLeft = topLeftRef.current;
        const topRight = topRightRef.current;
        const right = rightRef.current;
        const bottomLeft = bottomLeftRef.current;
        const bottomRight = bottomRightRef.current;
        const left = leftRef.current;

        const current = progressRef.current;
        const target = targetProgressRef.current;

        const factor = 0.18;
        const next = current + (target - current) * factor;
        progressRef.current = next;

        const p = next;

        if (topLeft && lengthsRef.current.topLeft)
            topLeft.style.strokeDashoffset = String(lengthsRef.current.topLeft * (1 - p));
        if (topRight && lengthsRef.current.topRight)
            topRight.style.strokeDashoffset = String(lengthsRef.current.topRight * (1 - p));
        if (right && lengthsRef.current.right)
            right.style.strokeDashoffset = String(lengthsRef.current.right * (1 - p));
        if (bottomLeft && lengthsRef.current.bottomLeft)
            bottomLeft.style.strokeDashoffset = String(lengthsRef.current.bottomLeft * (1 - p));
        if (bottomRight && lengthsRef.current.bottomRight)
            bottomRight.style.strokeDashoffset = String(lengthsRef.current.bottomRight * (1 - p));
        if (left && lengthsRef.current.left)
            left.style.strokeDashoffset = String(lengthsRef.current.left * (1 - p));

        if (p >= 0.999) {
            progressRef.current = 1;
            if (topLeft && lengthsRef.current.topLeft) topLeft.style.strokeDashoffset = "0";
            if (topRight && lengthsRef.current.topRight) topRight.style.strokeDashoffset = "0";
            if (right && lengthsRef.current.right) right.style.strokeDashoffset = "0";
            if (bottomLeft && lengthsRef.current.bottomLeft) bottomLeft.style.strokeDashoffset = "0";
            if (bottomRight && lengthsRef.current.bottomRight) bottomRight.style.strokeDashoffset = "0";
            if (left && lengthsRef.current.left) left.style.strokeDashoffset = "0";

            completedRef.current = true;
            if (rafRef.current !== null) {
                cancelAnimationFrame(rafRef.current);
                rafRef.current = null;
            }
            return;
        }

        if (Math.abs(target - next) > 0.001) {
            rafRef.current = requestAnimationFrame(animate);
        } else {
            progressRef.current = target;
            const final = target;
            if (topLeft && lengthsRef.current.topLeft) topLeft.style.strokeDashoffset = String(lengthsRef.current.topLeft * (1 - final));
            if (topRight && lengthsRef.current.topRight) topRight.style.strokeDashoffset = String(lengthsRef.current.topRight * (1 - final));
            if (right && lengthsRef.current.right) right.style.strokeDashoffset = String(lengthsRef.current.right * (1 - final));
            if (bottomLeft && lengthsRef.current.bottomLeft) bottomLeft.style.strokeDashoffset = String(lengthsRef.current.bottomLeft * (1 - final));
            if (bottomRight && lengthsRef.current.bottomRight) bottomRight.style.strokeDashoffset = String(lengthsRef.current.bottomRight * (1 - final));
            if (left && lengthsRef.current.left) left.style.strokeDashoffset = String(lengthsRef.current.left * (1 - final));

            rafRef.current = null;
        }
    };

    useEffect(() => {
        recomputeSvg();
        computeTargetProgress();

        const onScrollOrResize = () => {
            if (completedRef.current) return;
            computeTargetProgress();
            recomputeSvg();
        };

        window.addEventListener("scroll", onScrollOrResize, { passive: true });
        window.addEventListener("resize", onScrollOrResize);
        window.addEventListener("orientationchange", onScrollOrResize);

        return () => {
            window.removeEventListener("scroll", onScrollOrResize);
            window.removeEventListener("resize", onScrollOrResize);
            window.removeEventListener("orientationchange", onScrollOrResize);
            if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const { w, h } = svgSize;

    const padX = 30;
    const padY = 70;

    // top gap configuration (adjust this to make center cut wider/narrower)
    const topGap = 790; // in px — change as needed

    // bottom gap: make it smaller than top gap (you can tweak this)
    const bottomGap = Math.round(topGap * 0.65); // e.g. 60% of top gap

    // compute top segments so that there's a centered gap of width `topGap`
    const half = w ? Math.round(w / 2) : 0;
    const gapHalfTop = Math.round(topGap / 2);
    const leftEndX = Math.max(padX, half - gapHalfTop);
    const rightStartX = Math.min(w - padX, half + gapHalfTop);

    const topLeftPath = w ? `M ${padX} ${padY} H ${leftEndX}` : "";
    const topRightPath = w ? `M ${rightStartX} ${padY} H ${w - padX}` : "";

    // bottom segments (split into two with a smaller centered gap)
    const gapHalfBottom = Math.round(bottomGap / 2);
    const bottomLeftEndX = Math.max(padX, half - gapHalfBottom);
    const bottomRightStartX = Math.min(w - padX, half + gapHalfBottom);

    // bottom paths are at y = h - padY, left->right for bottomLeft and bottomRight
    const bottomLeftPath = w ? `M ${padX} ${h - padY} H ${bottomLeftEndX}` : "";
    const bottomRightPath = w ? `M ${bottomRightStartX} ${h - padY} H ${w - padX}` : "";

    // other sides (right and continuous left)
    const rightPath = w ? `M ${w - padX} ${padY} V ${h - padY}` : "";
    const leftPath = w ? `M ${padX} ${h - padY} V ${padY}` : ""; // up to top padY — continuous left

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
                        {/* top split into two visible segments with a center gap */}
                        <path ref={topLeftRef} d={topLeftPath} className={styles.outlinePath} />
                        <path ref={topRightRef} d={topRightPath} className={styles.outlinePath} />

                        <path ref={rightRef} d={rightPath} className={styles.outlinePath} />

                        {/* bottom now split into two segments with a smaller center gap */}
                        <path ref={bottomLeftRef} d={bottomLeftPath} className={styles.outlinePath} />
                        <path ref={bottomRightRef} d={bottomRightPath} className={styles.outlinePath} />

                        <path ref={leftRef} d={leftPath} className={styles.outlinePath} />
                    </svg>
                )}

                <div className={styles.content}>{children}</div>
            </div>
        </div>
    );
}
