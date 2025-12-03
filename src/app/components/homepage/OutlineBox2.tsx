"use client";
import React, { useEffect, useRef, useState } from "react";
import styles from "./OutlineBox2.module.css";

type Props = { children: React.ReactNode };

export default function OutlineBox({ children }: Props) {
    const wrapperRef = useRef<HTMLDivElement | null>(null);
    const boxRef = useRef<HTMLDivElement | null>(null);

    // SVG path refs
    const topRef = useRef<SVGPathElement | null>(null);
    const rightRef = useRef<SVGPathElement | null>(null);
    const bottomRef = useRef<SVGPathElement | null>(null);
    const leftTopRef = useRef<SVGPathElement | null>(null);
    const leftBottomRef = useRef<SVGPathElement | null>(null);

    // store lengths
    const lengthsRef = useRef({
        top: 0,
        right: 0,
        bottom: 0,
        leftTop: 0,
        leftBottom: 0,
    });

    const progressRef = useRef(0); // smoothed progress [0..1]
    const targetProgressRef = useRef(0);
    const rafRef = useRef<number | null>(null);

    // mark if fully drawn so we can stop listening/animating
    const completedRef = useRef(false);

    // svg size to match box
    const [svgSize, setSvgSize] = useState({ w: 0, h: 0 });

    // Compute target progress from scroll position
    const computeTargetProgress = () => {
        const wrapper = wrapperRef.current;
        const box = boxRef.current;
        if (!wrapper || !box) return;

        const rect = wrapper.getBoundingClientRect();
        const vh = window.innerHeight;

        const enterStart = vh; // when top === bottom of viewport -> start
        const enterEnd = vh * 0.35; // when top reaches 35% from top -> finished

        let progress = (enterStart - rect.top) / (enterStart - enterEnd);
        progress = Math.max(0, Math.min(1, progress));

        // if already completed, keep target at 1
        if (completedRef.current) {
            targetProgressRef.current = 1;
        } else {
            // allow target to move forward/back by default,
            // but if you prefer "only forward" drawing, use:
            // targetProgressRef.current = Math.max(progress, targetProgressRef.current);
            targetProgressRef.current = progress;
        }

        // ensure animation loop running
        if (rafRef.current === null) {
            rafRef.current = requestAnimationFrame(animate);
        }
    };

    // Recompute SVG size & paths (call on mount & resize)
    const recomputeSvg = () => {
        const box = boxRef.current;
        if (!box) return;

        const rect = box.getBoundingClientRect();
        const w = Math.max(20, Math.round(rect.width));
        const h = Math.max(20, Math.round(rect.height));

        // If size didn't change, still restore offsets according to current progress
        const sizeChanged = w !== svgSize.w || h !== svgSize.h;
        setSvgSize({ w, h });

        // After DOM updates, compute path lengths and set dash arrays.
        requestAnimationFrame(() => {
            const top = topRef.current;
            const right = rightRef.current;
            const bottom = bottomRef.current;
            const leftTop = leftTopRef.current;
            const leftBottom = leftBottomRef.current;

            // compute lengths (always recompute because geometry may change)
            const newTop = top ? top.getTotalLength() : 0;
            const newRight = right ? right.getTotalLength() : 0;
            const newBottom = bottom ? bottom.getTotalLength() : 0;
            const newLeftTop = leftTop ? leftTop.getTotalLength() : 0;
            const newLeftBottom = leftBottom ? leftBottom.getTotalLength() : 0;

            const prev = lengthsRef.current;
            const changed =
                newTop !== prev.top ||
                newRight !== prev.right ||
                newBottom !== prev.bottom ||
                newLeftTop !== prev.leftTop ||
                newLeftBottom !== prev.leftBottom ||
                sizeChanged;

            lengthsRef.current.top = newTop;
            lengthsRef.current.right = newRight;
            lengthsRef.current.bottom = newBottom;
            lengthsRef.current.leftTop = newLeftTop;
            lengthsRef.current.leftBottom = newLeftBottom;

            // set dasharray (always) and set dashoffset according to current progress (IMPORTANT: do NOT reset to full)
            const currProgress = progressRef.current ?? 0;

            if (top) {
                top.style.strokeDasharray = `${lengthsRef.current.top}`;
                top.style.strokeDashoffset = `${Math.round(lengthsRef.current.top * (1 - currProgress))}`;
            }
            if (right) {
                right.style.strokeDasharray = `${lengthsRef.current.right}`;
                right.style.strokeDashoffset = `${Math.round(lengthsRef.current.right * (1 - currProgress))}`;
            }
            if (bottom) {
                bottom.style.strokeDasharray = `${lengthsRef.current.bottom}`;
                bottom.style.strokeDashoffset = `${Math.round(lengthsRef.current.bottom * (1 - currProgress))}`;
            }
            if (leftTop) {
                leftTop.style.strokeDasharray = `${lengthsRef.current.leftTop}`;
                leftTop.style.strokeDashoffset = `${Math.round(lengthsRef.current.leftTop * (1 - currProgress))}`;
            }
            if (leftBottom) {
                leftBottom.style.strokeDasharray = `${lengthsRef.current.leftBottom}`;
                leftBottom.style.strokeDashoffset = `${Math.round(lengthsRef.current.leftBottom * (1 - currProgress))}`;
            }
        });
    };

    const animate = () => {
        const top = topRef.current;
        const right = rightRef.current;
        const bottom = bottomRef.current;
        const leftTop = leftTopRef.current;
        const leftBottom = leftBottomRef.current;

        const current = progressRef.current;
        const target = targetProgressRef.current;

        const factor = 0.18;
        const next = current + (target - current) * factor;
        progressRef.current = next;

        // For each path, set strokeDashoffset proportionally: offset = length * (1 - progress)
        const p = next;

        if (top && lengthsRef.current.top)
            top.style.strokeDashoffset = String(lengthsRef.current.top * (1 - p));
        if (right && lengthsRef.current.right)
            right.style.strokeDashoffset = String(lengthsRef.current.right * (1 - p));
        if (bottom && lengthsRef.current.bottom)
            bottom.style.strokeDashoffset = String(lengthsRef.current.bottom * (1 - p));
        if (leftTop && lengthsRef.current.leftTop)
            leftTop.style.strokeDashoffset = String(lengthsRef.current.leftTop * (1 - p));
        if (leftBottom && lengthsRef.current.leftBottom)
            leftBottom.style.strokeDashoffset = String(lengthsRef.current.leftBottom * (1 - p));

        // if we reached (or very near) 1, mark completed and stop listening/animating
        if (p >= 0.999) {
            progressRef.current = 1;
            // ensure fully visible
            if (top && lengthsRef.current.top) top.style.strokeDashoffset = "0";
            if (right && lengthsRef.current.right) right.style.strokeDashoffset = "0";
            if (bottom && lengthsRef.current.bottom) bottom.style.strokeDashoffset = "0";
            if (leftTop && lengthsRef.current.leftTop) leftTop.style.strokeDashoffset = "0";
            if (leftBottom && lengthsRef.current.leftBottom) leftBottom.style.strokeDashoffset = "0";

            completedRef.current = true;

            // cancel RAF & remove scroll listeners (cleanup happens in effect cleanup too)
            if (rafRef.current !== null) {
                cancelAnimationFrame(rafRef.current);
                rafRef.current = null;
            }
            // remove listeners by dispatching a synthetic cleanup (we'll rely on effect cleanup)
            return;
        }

        if (Math.abs(target - next) > 0.001) {
            rafRef.current = requestAnimationFrame(animate);
        } else {
            // snap
            progressRef.current = target;
            const final = target;
            if (top && lengthsRef.current.top) top.style.strokeDashoffset = String(lengthsRef.current.top * (1 - final));
            if (right && lengthsRef.current.right) right.style.strokeDashoffset = String(lengthsRef.current.right * (1 - final));
            if (bottom && lengthsRef.current.bottom) bottom.style.strokeDashoffset = String(lengthsRef.current.bottom * (1 - final));
            if (leftTop && lengthsRef.current.leftTop) leftTop.style.strokeDashoffset = String(lengthsRef.current.leftTop * (1 - final));
            if (leftBottom && lengthsRef.current.leftBottom) leftBottom.style.strokeDashoffset = String(lengthsRef.current.leftBottom * (1 - final));

            rafRef.current = null;
        }
    };

    useEffect(() => {
        // initial compute
        recomputeSvg();
        computeTargetProgress();

        const onScrollOrResize = () => {
            // if already completed, don't bother recomputing target (prevents flicker)
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

    // build path coordinates based on measured svg size
    const { w, h } = svgSize;

    // padding inside the visual box (match your previous padding)
    const padX = 30;
    const padY = 70;

    // left short segments height
    const leftTopH = 250;
    const leftBottomH = 120;

    // path strings
    const topPath = w ? `M ${padX} ${padY} H ${w - padX}` : "";
    const rightPath = w ? `M ${w - padX} ${padY} V ${h - padY}` : "";
    const bottomPath = w ? `M ${w - padX} ${h - padY} H ${padX}` : "";
    const leftTopPath = w ? `M ${padX} ${padY} V ${padY + leftTopH}` : "";
    const leftBottomPath = w ? `M ${padX} ${h - padY} V ${h - padY - leftBottomH}` : "";

    return (
        <div className={styles.outlineWrapper} ref={wrapperRef}>
            <div className={styles.outlineBox} ref={boxRef}>
                {/* SVG overlay positioned absolutely to match the box size */}
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
