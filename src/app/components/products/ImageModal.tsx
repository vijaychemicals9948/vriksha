"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./ImageModal.module.css";

type Product = {
    img: string;
    zoomImg?: string;
    title?: string;
};

type Props = {
    products: Product[];
    open: boolean;
    activeIndex: number | null;
    onClose: () => void;
    onMove?: (dir: 1 | -1) => void;
};

const MIN_SCALE = 1;
const DEFAULT_SCALE = 1;
const INITIAL_ZOOM_SCALE = 1.8;
const MAX_SCALE = 3;
const MIN_WHEEL_SCALE = 1;

const DRAG_THRESHOLD = 6; // 👈 important

export default function ImageModal({
    products,
    open,
    activeIndex,
    onClose,
    onMove,
}: Props) {
    const zoomWrapRef = useRef<HTMLDivElement | null>(null);
    const imgRef = useRef<HTMLImageElement | null>(null);
    const overlayRef = useRef<HTMLDivElement | null>(null);
    const closeBtnRef = useRef<HTMLButtonElement | null>(null);
    const prevFocusRef = useRef<Element | null>(null);
    const rafRef = useRef<number | null>(null);

    const [scale, setScale] = useState(DEFAULT_SCALE);
    const [origin, setOrigin] = useState({ x: 50, y: 50 });
    const [translate, setTranslate] = useState({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);

    const lastPointer = useRef<{ x: number; y: number } | null>(null);
    const didDragRef = useRef(false);
    const pendingOrigin = useRef<{ x: number; y: number } | null>(null);
    const lastTapRef = useRef<number>(0);

    // -------------------- EFFECTS --------------------

    useEffect(() => {
        prevFocusRef.current = document.activeElement;
        if (open) document.documentElement.style.overflow = "hidden";
        closeBtnRef.current?.focus?.();

        function onKey(e: KeyboardEvent) {
            if (e.key === "Escape") onClose();
            if (e.key === "ArrowLeft") onMove?.(-1);
            if (e.key === "ArrowRight") onMove?.(1);
        }

        window.addEventListener("keydown", onKey);
        return () => {
            window.removeEventListener("keydown", onKey);
            document.documentElement.style.overflow = "";
            (prevFocusRef.current as HTMLElement | null)?.focus?.();
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [onClose, open, onMove]);

    useEffect(() => {
        if (scale <= 1.001) {
            setTranslate({ x: 0, y: 0 });
            setOrigin({ x: 50, y: 50 });
        } else {
            setTranslate((t) => clampTranslateToBounds(t.x, t.y));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [scale]);

    if (!open || activeIndex === null) return null;

    const product = products[activeIndex];
    const imgSrc = product.zoomImg ?? product.img;

    // -------------------- HELPERS --------------------

    function pointToPercent(clientX: number, clientY: number) {
        const rect = zoomWrapRef.current!.getBoundingClientRect();
        return {
            x: ((clientX - rect.left) / rect.width) * 100,
            y: ((clientY - rect.top) / rect.height) * 100,
        };
    }

    function scheduleOriginUpdate(o: { x: number; y: number }) {
        pendingOrigin.current = o;
        if (rafRef.current == null) {
            rafRef.current = requestAnimationFrame(() => {
                if (pendingOrigin.current) setOrigin(pendingOrigin.current);
                pendingOrigin.current = null;
                rafRef.current = null;
            });
        }
    }

    function toggleZoom() {
        if (scale === MIN_SCALE) {
            setScale(INITIAL_ZOOM_SCALE);
            setTranslate({ x: 0, y: 0 });
        } else {
            setScale(MIN_SCALE);
            setTranslate({ x: 0, y: 0 });
            setOrigin({ x: 50, y: 50 });
        }
    }

    function clampTranslateToBounds(tx: number, ty: number) {
        const wrap = zoomWrapRef.current;
        const img = imgRef.current;
        if (!wrap || !img) return { x: tx, y: ty };

        const wrapRect = wrap.getBoundingClientRect();
        const imgRect = img.getBoundingClientRect();
        const scaledW = imgRect.width * scale;
        const scaledH = imgRect.height * scale;

        const maxX = Math.max(0, (scaledW - wrapRect.width) / 2);
        const maxY = Math.max(0, (scaledH - wrapRect.height) / 2);

        return {
            x: Math.max(-maxX, Math.min(maxX, tx)),
            y: Math.max(-maxY, Math.min(maxY, ty)),
        };
    }

    // -------------------- EVENTS --------------------

    function onWheel(e: React.WheelEvent) {
        e.preventDefault();
        const delta = -e.deltaY;
        const factor = delta > 0 ? 1.05 : 0.95;

        setScale((prev) =>
            Math.max(MIN_WHEEL_SCALE, Math.min(MAX_SCALE, prev * factor))
        );

        scheduleOriginUpdate(pointToPercent(e.clientX, e.clientY));
    }

    function onPointerDown(e: React.PointerEvent) {
        if (scale === MIN_SCALE) return;

        (e.target as Element).setPointerCapture(e.pointerId);
        setIsPanning(true);
        didDragRef.current = false;
        lastPointer.current = { x: e.clientX, y: e.clientY };
    }

    function onPointerMove(e: React.PointerEvent) {
        if (!isPanning || !lastPointer.current) return;

        const dx = e.clientX - lastPointer.current.x;
        const dy = e.clientY - lastPointer.current.y;

        if (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD) {
            didDragRef.current = true;
        }

        setTranslate((t) => ({ x: t.x + dx, y: t.y + dy }));
        lastPointer.current = { x: e.clientX, y: e.clientY };
    }

    function onPointerUp(e: React.PointerEvent) {
        setIsPanning(false);
        lastPointer.current = null;

        try {
            (e.target as Element).releasePointerCapture?.(e.pointerId);
        } catch { }

        setTranslate((t) => clampTranslateToBounds(t.x, t.y));
    }

    function onTouchStart(e: React.TouchEvent) {
        const now = Date.now();
        const touch = e.touches[0];
        if (!touch) return;

        const p = pointToPercent(touch.clientX, touch.clientY);

        if (now - lastTapRef.current < 300) {
            toggleZoom();
            setOrigin(p);
            lastTapRef.current = 0;
        } else {
            lastTapRef.current = now;
        }
    }

    const transformStyle: React.CSSProperties = {
        transformOrigin: `${origin.x}% ${origin.y}%`,
        transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
        transition: isPanning ? "none" : "transform 220ms cubic-bezier(.2,.9,.2,1)",
    };

    function handleOverlayClick(e: React.MouseEvent) {
        if (e.target === overlayRef.current) onClose();
    }

    // -------------------- RENDER --------------------

    return (
        <div
            className={styles.overlay}
            ref={overlayRef}
            onClick={handleOverlayClick}
            role="dialog"
            aria-modal="true"
        >
            <button
                aria-label="Close"
                className={styles.closeBtn}
                onClick={onClose}
                ref={closeBtnRef}
            >
                ×
            </button>

            <div className={styles.zoomWrap}>
                <div
                    ref={zoomWrapRef}
                    className={styles.imageViewport}
                    style={{
                        cursor:
                            scale === MIN_SCALE
                                ? "zoom-in"
                                : isPanning
                                    ? "grabbing"
                                    : "grab",
                    }}
                    onClick={(e) => {
                        e.stopPropagation();
                        if (didDragRef.current) return; // ⭐ FIX
                        toggleZoom();
                    }}
                    onWheel={onWheel}
                    onPointerDown={onPointerDown}
                    onPointerMove={onPointerMove}
                    onPointerUp={onPointerUp}
                    onPointerCancel={onPointerUp}
                    onTouchStart={onTouchStart}
                >
                    <img
                        ref={imgRef}
                        src={imgSrc}
                        alt={product.title ?? "product image"}
                        className={styles.zoomImg}
                        style={transformStyle}
                        draggable={false}
                    />
                </div>

                <div className={styles.caption}>
                    {product.title}
                    <span className={styles.hint}>
                        {" "}
                        — Click/tap to zoom, wheel to zoom, drag to pan
                    </span>
                </div>
            </div>
        </div>
    );
}
