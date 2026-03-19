import type { PointerEvent as ReactPointerEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useBannerSwitch } from "../../hooks/useBannerSwitch";
import { useBarcode } from "../../hooks/useBarcode";
import { useCurrentUrl } from "../../hooks/useCurrentUrl";
import { useOFF } from "../../hooks/useOFF";
import type { StoreConfig } from "../../retailers/configs/types";
import { buttonY } from "../../retailers/storage";
import { FloatingButton } from "./FloatingButton";
import { ScoreCard } from "./ScoreCard";

const BTN_H = 52;
const EDGE = 6;

interface FloatingAppProps {
  config: StoreConfig;
}

/** Overlay root component: a draggable floating button that shows a score preview card on hover. */
export function FloatingApp({ config }: FloatingAppProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [posY, setPosY] = useState(0);
  const [posReady, setPosReady] = useState(false);
  const posYRef = useRef(0);
  const isDragging = useRef(false);
  const hasMoved = useRef(false);
  const dragStartClientY = useRef(0);
  const dragStartPosY = useRef(0);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { enabled, isReady } = useBannerSwitch(config.storageKey);
  const currentUrl = useCurrentUrl();
  const barcode = useBarcode(config, currentUrl);
  const { data, loading } = useOFF(barcode);

  useEffect(() => {
    buttonY.getValue().then((raw) => {
      const defaultY = Math.round(window.innerHeight / 2 - BTN_H / 2);
      const val = raw ?? defaultY;
      const clamped = Math.max(
        EDGE,
        Math.min(window.innerHeight - BTN_H - EDGE, val),
      );
      posYRef.current = clamped;
      setPosY(clamped);
      setPosReady(true);
    });
  }, []);

  useEffect(
    () => () => {
      if (hoverTimer.current) clearTimeout(hoverTimer.current);
    },
    [],
  );

  const handleMouseEnter = useCallback(() => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    hoverTimer.current = setTimeout(() => setIsHovered(false), 120);
  }, []);

  const onPointerDown = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    isDragging.current = true;
    hasMoved.current = false;
    dragStartClientY.current = e.clientY;
    dragStartPosY.current = posYRef.current;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    e.preventDefault();
  }, []);

  const onPointerMove = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    if (!isDragging.current) return;
    const dy = e.clientY - dragStartClientY.current;
    if (Math.abs(dy) > 3) hasMoved.current = true;
    const next = Math.max(
      EDGE,
      Math.min(window.innerHeight - BTN_H - EDGE, dragStartPosY.current + dy),
    );
    posYRef.current = next;
    setPosY(next);
  }, []);

  const onPointerUp = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;
    if (hasMoved.current) {
      buttonY.setValue(posYRef.current);
    }
  }, []);

  if (!isReady || !enabled || !posReady) return null;
  if (!config.isProductPage()) return null;

  const showHoverPreview = isHovered && !!barcode && !!data;

  return (
    <div
      className="fixed right-0 z-[2147483647] pointer-events-none h-[52px] w-0"
      style={{ top: posY }}
    >
      <div
        className="pointer-events-auto absolute right-0 top-0"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {showHoverPreview && (
          <div
            style={{
              position: "fixed",
              top: posY + BTN_H + 8,
              right: 0,
              pointerEvents: "auto",
            }}
          >
            <ScoreCard product={data} barcode={barcode} />
          </div>
        )}

        <div
          className="select-none touch-none"
          style={{ cursor: "grab" }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
        >
          <FloatingButton loading={!!barcode && loading && !data} />
        </div>
      </div>
    </div>
  );
}
