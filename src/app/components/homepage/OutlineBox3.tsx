"use client";
import React, { useEffect, useRef, useState } from "react";
import styles from "./OutlineBox3.module.css";

type Props = {
    children: React.ReactNode;
    topGap?: number;
    bottomGap?: number;
    bottomGapRatio?: number;
    leftTopLength?: number;
    leftBottomLength?: number;
};

export default function OutlineBox3({
    children,
    topGap = 0,
    bottomGap,
    bottomGapRatio = 0.65,
    leftTopLength = 60,
    leftBottomLength = 2260,
}: Props) {
    const wrapperRef = useRef<HTMLDivElement | null>(null);
    const boxRef = useRef<HTMLDivElement | null>(null);

    const topRef = useRef<SVGPathElement | null>(null);
    const rightRef = useRef<SVGPathElement | null>(null);
    const bottomLeftRef = useRef<SVGPathElement | null>(null);
    const bottomRightRef = useRef<SVGPathElement | null>(null);
    const leftTopRef = useRef<SVGPathElement | null>(null);
    const leftBottomRef = useRef<SVGPathElement | null>(null);

    const lengthsRef = useRef({
        top: 0,
        right: 0,
        bottomLeft: 0,
        bottomRight: 0,
        leftTop: 0,
        leftBottom: 0,
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

        targetProgressRef.current = completedRef.current ? 1 : progress;

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
            const top = topRef.current;
            const right = rightRef.current;
            const bottomLeft = bottomLeftRef.current;
            const bottomRight = bottomRightRef.current;
            const leftTop = leftTopRef.current;
            const leftBottom = leftBottomRef.current;

            const newTop = top ? top.getTotalLength() : 0;
            const newRight = right ? right.getTotalLength() : 0;
            const newBottomLeft = bottomLeft ? bottomLeft.getTotalLength() : 0;
            const newBottomRight = bottomRight ? bottomRight.getTotalLength() : 0;
            const newLeftTop = leftTop ? leftTop.getTotalLength() : 0;
            const newLeftBottom = leftBottom ? leftBottom.getTotalLength() : 0;

            const prev = lengthsRef.current;

            lengthsRef.current.top = newTop;
            lengthsRef.current.right = newRight;
            lengthsRef.current.bottomLeft = newBottomLeft;
            lengthsRef.current.bottomRight = newBottomRight;
            lengthsRef.current.leftTop = newLeftTop;
            lengthsRef.current.leftBottom = newLeftBottom;

            const currProgress = progressRef.current ?? 0;

            const setDash = (el: SVGPathElement | null, len: number) => {
                if (!el) return;
                el.style.strokeDasharray = `${len}`;
                el.style.strokeDashoffset = `${Math.round(len * (1 - currProgress))}`;
            };

            setDash(top, lengthsRef.current.top);
            setDash(right, lengthsRef.current.right);
            setDash(bottomLeft, lengthsRef.current.bottomLeft);
            setDash(bottomRight, lengthsRef.current.bottomRight);
            setDash(leftTop, lengthsRef.current.leftTop);
            setDash(leftBottom, lengthsRef.current.leftBottom);
        });
    };

    const animate = () => {
        const top = topRef.current;
        const right = rightRef.current;
        const bottomLeft = bottomLeftRef.current;
        const bottomRight = bottomRightRef.current;
        const leftTop = leftTopRef.current;
        const leftBottom = leftBottomRef.current;

        const current = progressRef.current;
        const target = targetProgressRef.current;

        const factor = 0.18;
        const next = current + (target - current) * factor;
        progressRef.current = next;

        const p = next;

        const setOffset = (el: SVGPathElement | null, len: number) => {
            if (!el || !len) return;
            el.style.strokeDashoffset = String(len * (1 - p));
        };

        setOffset(top, lengthsRef.current.top);
        setOffset(right, lengthsRef.current.right);
        setOffset(bottomLeft, lengthsRef.current.bottomLeft);
        setOffset(bottomRight, lengthsRef.current.bottomRight);
        setOffset(leftTop, lengthsRef.current.leftTop);
        setOffset(leftBottom, lengthsRef.current.leftBottom);

        if (p >= 0.999) {
            progressRef.current = 1;
            [top, right, bottomLeft, bottomRight, leftTop, leftBottom].forEach((el) => {
                if (!el) return;
                el.style.strokeDashoffset = "0";
            });

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
            const setFinal = (el: SVGPathElement | null, len: number) => {
                if (!el || !len) return;
                el.style.strokeDashoffset = String(len * (1 - final));
            };
            setFinal(top, lengthsRef.current.top);
            setFinal(right, lengthsRef.current.right);
            setFinal(bottomLeft, lengthsRef.current.bottomLeft);
            setFinal(bottomRight, lengthsRef.current.bottomRight);
            setFinal(leftTop, lengthsRef.current.leftTop);
            setFinal(leftBottom, lengthsRef.current.leftBottom);

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
    }, [topGap, bottomGap, bottomGapRatio, leftTopLength, leftBottomLength]);

    const { w, h } = svgSize;

    // --- Responsive padX/padY: MATCH OutlineBox behaviour on small screens ---
    const padX = (() => {
        if (!w) return 30;
        if (w <= 420) return 12; // small phones — snug
        if (w <= 760) return 18;
        return 30;
    })();

    const padY = (() => {
        if (!w) return 70;
        if (w <= 420) return 28; // reduce vertical inset on tiny screens (match OutlineBox)
        if (w <= 760) return 50;
        return 70;
    })();

    // --- Resolve bottom gap: remove on small phones so bottom is continuous like OutlineBox ---
    let resolvedBottomGap = typeof bottomGap === "number" ? bottomGap : Math.round(topGap * bottomGapRatio);
    if (w && w <= 420) resolvedBottomGap = 0;

    // top is single continuous line
    const topPath = w ? `M ${padX} ${padY} H ${w - padX}` : "";

    // bottom segments (still split into two unless gap==0)
    const half = w ? Math.round(w / 2) : 0;
    const gapHalfBottom = Math.round(resolvedBottomGap / 2);
    const bottomLeftEndX = Math.max(padX, half - gapHalfBottom);
    const bottomRightStartX = Math.min(w - padX, half + gapHalfBottom);
    const bottomLeftPath = w ? `M ${padX} ${h - padY} H ${bottomLeftEndX}` : "";
    const bottomRightPath = w ? `M ${bottomRightStartX} ${h - padY} H ${w - padX}` : "";

    // right side - continuous vertical line
    const rightPath = w ? `M ${w - padX} ${padY} V ${h - padY}` : "";

    // left behavior: on small phones cap to OutlineBox's short segments
    const topLenParam = w && w <= 420 ? 90 : leftTopLength;
    const bottomLenParam = w && w <= 420 ? 120 : leftBottomLength;

    let leftTopPath = "";
    let leftBottomPath = "";
    let leftContinuousPath = "";

    if (!w) {
        leftTopPath = leftBottomPath = leftContinuousPath = "";
    } else {
        if (topLenParam <= 0 && bottomLenParam <= 0) {
            leftContinuousPath = `M ${padX} ${h - padY} V ${padY}`;
        } else {
            const maxVisible = Math.max(0, h - 2 * padY);
            const topLen = Math.min(topLenParam, maxVisible);
            const bottomLen = Math.min(bottomLenParam, maxVisible);

            if (topLen > 0) leftTopPath = `M ${padX} ${padY} V ${Math.min(padY + topLen, h - padY)}`;
            if (bottomLen > 0) leftBottomPath = `M ${padX} ${h - padY - bottomLen} V ${h - padY}`;
        }
    }

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
                        <path ref={bottomLeftRef} d={bottomLeftPath} className={styles.outlinePath} />
                        <path ref={bottomRightRef} d={bottomRightPath} className={styles.outlinePath} />

                        {leftContinuousPath ? (
                            <path d={leftContinuousPath} ref={leftTopRef} className={styles.outlinePath} />
                        ) : (
                            <>
                                {leftTopPath && <path d={leftTopPath} ref={leftTopRef} className={styles.outlinePath} />}
                                {leftBottomPath && <path d={leftBottomPath} ref={leftBottomRef} className={styles.outlinePath} />}
                            </>
                        )}
                    </svg>
                )}

                <div className={styles.content}>{children}</div>
            </div>
        </div>
    );
}