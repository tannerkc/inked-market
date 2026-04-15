"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import type React from "react";

interface UseSwipeDismissOptions {
  onDismiss: () => void;
  threshold?: number;
  enabled?: boolean;
}

interface UseSwipeDismissReturn {
  handleRef: React.RefObject<HTMLDivElement | null>;
  dragStyle: React.CSSProperties;
  onPointerDown: React.PointerEventHandler<HTMLDivElement>;
}

export function useSwipeDismiss({
  onDismiss,
  threshold = 80,
  enabled = true,
}: UseSwipeDismissOptions): UseSwipeDismissReturn {
  const handleRef = useRef<HTMLDivElement | null>(null);
  const startY = useRef(0);
  const isDragging = useRef(false);
  const [offsetY, setOffsetY] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!enabled) return;
      isDragging.current = true;
      startY.current = e.clientY;
      setOffsetY(0);
      setIsAnimating(false);
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [enabled],
  );

  useEffect(() => {
    if (!enabled) return;

    function handleMove(e: PointerEvent) {
      if (!isDragging.current) return;
      const delta = e.clientY - startY.current;
      // Only allow downward drag
      if (delta > 0) {
        setOffsetY(delta * 0.7); // Damped feel
      }
    }

    function handleUp() {
      if (!isDragging.current) return;
      isDragging.current = false;

      setIsAnimating(true);
      if (offsetY > threshold) {
        onDismiss();
      }
      setOffsetY(0);
    }

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
    window.addEventListener("pointercancel", handleUp);

    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
      window.removeEventListener("pointercancel", handleUp);
    };
  }, [enabled, offsetY, threshold, onDismiss]);

  const dragStyle: React.CSSProperties = {
    transform: offsetY > 0 ? `translateY(${offsetY}px)` : undefined,
    transition: isAnimating ? "transform 0.2s ease-out" : "none",
  };

  return { handleRef, dragStyle, onPointerDown };
}
